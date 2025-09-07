/**
 * Socket Service
 * Purpose: Handle all WebSocket communication for real-time messaging
 * Why: Centralizes socket logic and provides clean API for components
 */

import { io } from 'socket.io-client';
import config from '../config';
import { getStoredToken } from '../utils/storage';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.isConnecting = false; // Track connection state
        this.messageListeners = new Set();
        this.connectionListeners = new Set();
    }

    /**
     * Connect to WebSocket server
     */
    async connect() {
        try {
            // Prevent multiple simultaneous connections
            if (this.isConnecting) {
                console.log('Connection already in progress, waiting...');
                return new Promise((resolve) => {
                    const checkConnection = () => {
                        if (!this.isConnecting) {
                            resolve();
                        } else {
                            setTimeout(checkConnection, 100);
                        }
                    };
                    checkConnection();
                });
            }

            // If already connected, don't reconnect
            if (this.isConnected && this.socket) {
                console.log('Already connected to WebSocket');
                return Promise.resolve();
            }

            this.isConnecting = true;

            const token = await getStoredToken();
            if (!token) {
                this.isConnecting = false;
                throw new Error('No authentication token found');
            }

            // Only disconnect if we have a socket but it's not connected
            if (this.socket && !this.isConnected) {
                console.log('Disconnecting stale socket connection');
                this.disconnect();
            }

            // Create new socket connection
            this.socket = io(config.SOCKET_URL, {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
            });

            // Set up event listeners
            this.setupEventListeners();

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.isConnecting = false;
                    reject(new Error('Connection timeout'));
                }, 10000); // 10 second timeout

                this.socket.on('connect', () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.isConnecting = false;
                    console.log('Socket connected successfully');
                    this.notifyConnectionListeners(true);
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    console.error('Socket connection error:', error);
                    reject(error);
                });
            });

        } catch (error) {
            this.isConnecting = false;
            console.error('Failed to connect to socket:', error);
            throw error;
        }
    }

    /**
     * Set up socket event listeners
     */
    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Socket disconnected');
            this.notifyConnectionListeners(false);
        });

        this.socket.on('reconnect', () => {
            this.isConnected = true;
            console.log('Socket reconnected');
            this.notifyConnectionListeners(true);
        });

        // Message events
        this.socket.on('receive_message', (message) => {
            console.log('Received message:', message);
            this.notifyMessageListeners(message);
        });

        this.socket.on('message_sent', (message) => {
            console.log('Message sent confirmation:', message);
            // Notify listeners about message confirmation
            this.messageListeners.forEach(listener => {
                if (typeof listener.onMessageConfirmed === 'function') {
                    listener.onMessageConfirmed(message);
                }
            });
        });

        // Error events (backend sends custom error events)
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            // You can add error handling here if needed
        });

        // Handle connection errors differently
        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.isConnecting = false;
            console.log('Socket disconnected');
            this.notifyConnectionListeners(false);
        }
    }

    /**
     * Force reconnection (for user switching)
     */
    async forceReconnect() {
        console.log('Forcing socket reconnection');
        this.disconnect();
        await this.connect();
    }

    /**
     * Send a message
     * @param {number} toUserId - Recipient user ID
     * @param {string} message - Message text
     */
    sendMessage(toUserId, message) {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        const messageData = {
            to_user_id: toUserId,
            message: message.trim()
        };

        console.log('Sending message:', messageData);
        this.socket.emit('send_message', messageData);
    }

    /**
     * Get chat history
     * @param {number} otherUserId - Other user ID
     * @param {number} limit - Number of messages to fetch
     */
    getChatHistory(otherUserId, limit = 50) {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.socket.off('chat_history', handleChatHistory);
                this.socket.off('error', handleError);
                reject(new Error('Chat history request timeout'));
            }, 10000); // Increased timeout to 10 seconds

            // Listen for chat history response
            const handleChatHistory = (data) => {
                if (data.other_user_id === otherUserId) {
                    clearTimeout(timeout);
                    this.socket.off('chat_history', handleChatHistory);
                    this.socket.off('error', handleError);
                    resolve(data.messages || []);
                }
            };

            // Listen for errors
            const handleError = (error) => {
                clearTimeout(timeout);
                this.socket.off('chat_history', handleChatHistory);
                this.socket.off('error', handleError);
                reject(new Error(error.message || 'Failed to get chat history'));
            };

            // Add one-time listeners
            this.socket.on('chat_history', handleChatHistory);
            this.socket.once('error', handleError);

            // Request chat history
            console.log(`Requesting chat history for user ${otherUserId}`);
            this.socket.emit('get_chat_history', {
                other_user_id: otherUserId,
                limit
            });
        });
    }

    /**
     * Add message listener
     * @param {Function} listener - Function to call when message received
     */
    addMessageListener(listener) {
        this.messageListeners.add(listener);
    }

    /**
     * Remove message listener
     * @param {Function} listener - Listener function to remove
     */
    removeMessageListener(listener) {
        this.messageListeners.delete(listener);
    }

    /**
     * Add connection status listener
     * @param {Function} listener - Function to call when connection status changes
     */
    addConnectionListener(listener) {
        this.connectionListeners.add(listener);
    }

    /**
     * Remove connection status listener
     * @param {Function} listener - Listener function to remove
     */
    removeConnectionListener(listener) {
        this.connectionListeners.delete(listener);
    }

    /**
     * Notify all message listeners
     * @param {Object} message - Received message
     */
    notifyMessageListeners(message) {
        this.messageListeners.forEach(listener => {
            try {
                // Handle both function and object listeners
                if (typeof listener === 'function') {
                    listener(message);
                } else if (listener && typeof listener.onMessage === 'function') {
                    listener.onMessage(message);
                }
            } catch (error) {
                console.error('Error in message listener:', error);
            }
        });
    }

    /**
     * Notify all connection listeners
     * @param {boolean} isConnected - Connection status
     */
    notifyConnectionListeners(isConnected) {
        this.connectionListeners.forEach(listener => {
            try {
                listener(isConnected);
            } catch (error) {
                console.error('Error in connection listener:', error);
            }
        });
    }

    /**
     * Get connection status
     * @returns {boolean} - True if connected
     */
    getConnectionStatus() {
        return this.isConnected;
    }
}

// Export singleton instance
export default new SocketService();
