/**
 * Chat Screen
 * Purpose: Handle one-on-one chat conversations with real-time messaging
 * Why: Dedicated screen for messaging functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { getStoredUser } from '../utils/storage';
import socketService from '../services/socketService';

const ChatScreen = ({ route, navigation }) => {
    const { otherUser } = route.params; // User we're chatting with
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);
    const flatListRef = useRef(null);

    /**
     * Initialize chat screen
     */
    useEffect(() => {
        initializeChat();
        return () => {
            // Cleanup listeners when component unmounts
            const messageListener = {
                onMessage: handleNewMessage,
                onMessageConfirmed: handleMessageConfirmed
            };
            socketService.removeMessageListener(messageListener);
            socketService.removeConnectionListener(handleConnectionChange);
        };
    }, []);

    /**
     * Initialize chat functionality
     */
    const initializeChat = async () => {
        try {
            // Get current user
            const user = await getStoredUser();
            if (!user) {
                Alert.alert('Error', 'User not found');
                navigation.goBack();
                return;
            }
            setCurrentUser(user);

            // Debug logging
            console.log(`Current user: ${user.id} (${user.username})`);
            console.log(`Other user: ${otherUser.id} (${otherUser.username})`);
            console.log(`Chat between: ${user.username} and ${otherUser.username}`);

            // Connect to socket if not already connected with correct user
            if (!socketService.getConnectionStatus()) {
                console.log('Connecting to WebSocket');
                await socketService.connect();
            } else {
                console.log('WebSocket already connected');
            }
            setConnected(socketService.getConnectionStatus());

            // Add listeners
            const messageListener = {
                onMessage: handleNewMessage,
                onMessageConfirmed: handleMessageConfirmed
            };
            socketService.addMessageListener(messageListener);
            socketService.addConnectionListener(handleConnectionChange);

            // Load chat history (don't await to avoid blocking the UI)
            loadChatHistory();

        } catch (error) {
            console.error('Failed to initialize chat:', error);
            Alert.alert('Connection Error', 'Failed to connect to chat server');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load chat history
     */
    const loadChatHistory = async () => {
        try {
            console.log(`Loading chat history with user ${otherUser.id} (${otherUser.username})`);
            const history = await socketService.getChatHistory(otherUser.id);
            console.log(`Received ${history.length} messages from history`);
            setMessages(history); // Backend already returns in chronological order (oldest first)
        } catch (error) {
            console.error('Failed to load chat history:', error);
            // Don't show error to user, just start with empty chat
            // This allows users to start fresh conversations
            setMessages([]);
        }
    };

    /**
     * Handle new message received
     */
    const handleNewMessage = (message) => {
        // Only add message if it's from the user we're chatting with
        if (message.from_user_id === otherUser.id || message.to_user_id === otherUser.id) {
            setMessages(prevMessages => [...prevMessages, message]);
            // Scroll to bottom when new message arrives
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    /**
     * Handle message confirmation (replace temporary message)
     */
    const handleMessageConfirmed = (confirmedMessage) => {
        setMessages(prevMessages => {
            // Replace temporary message with confirmed message
            return prevMessages.map(msg => {
                // Find temporary message by content and user (since temp ID is different)
                if (msg.sending &&
                    msg.message === confirmedMessage.message &&
                    msg.from_user_id === confirmedMessage.from_user_id &&
                    msg.to_user_id === confirmedMessage.to_user_id) {
                    // Replace with confirmed message (remove sending flag)
                    return { ...confirmedMessage, sending: false };
                }
                return msg;
            });
        });
        setSending(false); // Clear sending state
    };

    /**
     * Handle connection status change
     */
    const handleConnectionChange = (isConnected) => {
        setConnected(isConnected);
    };

    /**
     * Send message
     */
    const sendMessage = async () => {
        if (!messageText.trim() || sending || !connected) {
            return;
        }

        const message = messageText.trim();
        setMessageText('');
        setSending(true);

        try {
            // Add message to local state immediately (optimistic update)
            const tempMessage = {
                id: Date.now(), // Temporary ID
                from_user_id: currentUser.id,
                from_username: currentUser.username,
                to_user_id: otherUser.id,
                to_username: otherUser.username,
                message: message,
                timestamp: new Date().toISOString(),
                sending: true // Mark as sending
            };

            setMessages(prevMessages => [...prevMessages, tempMessage]);

            // Send via socket
            socketService.sendMessage(otherUser.id, message);

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error) {
            console.error('Failed to send message:', error);
            Alert.alert('Send Error', 'Failed to send message');

            // Remove the temporary message on error
            setMessages(prevMessages =>
                prevMessages.filter(msg => msg.id !== tempMessage.id)
            );
            setSending(false); // Clear sending state on error
        }
    };

    /**
     * Render message item
     */
    const renderMessage = ({ item }) => {
        const isMyMessage = item.from_user_id === currentUser?.id;
        const messageTime = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMyMessage ? styles.myMessageText : styles.otherMessageText
                    ]}>
                        {item.message}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isMyMessage ? styles.myMessageTime : styles.otherMessageTime
                    ]}>
                        {messageTime}
                        {item.sending && ' • Sending...'}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading chat...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{otherUser.username}</Text>
                    <Text style={styles.headerSubtitle}>
                        {connected ? 'Online' : 'Connecting...'}
                    </Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            Start your conversation with {otherUser.username}
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                            Send a message to get started!
                        </Text>
                    </View>
                }
            />

            {/* Message Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Type a message..."
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                        maxLength={1000}
                        editable={connected && !sending}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!messageText.trim() || !connected || sending) && styles.sendButtonDisabled
                        ]}
                        onPress={sendMessage}
                        disabled={!messageText.trim() || !connected || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.sendButtonText}>Send</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        paddingVertical: 8,
        paddingRight: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    headerRight: {
        width: 60, // Balance the back button
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 16,
    },
    messageContainer: {
        marginVertical: 4,
        marginHorizontal: 16,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
    },
    myMessageBubble: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#333',
    },
    messageTime: {
        fontSize: 12,
        marginTop: 4,
    },
    myMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherMessageTime: {
        color: '#666',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 60,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default ChatScreen;
