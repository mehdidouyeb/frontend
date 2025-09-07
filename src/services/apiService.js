/**
 * API Service
 * Purpose: Handle all HTTP requests to the backend
 * Why: Centralizes all API calls and error handling
 */

import axios from 'axios';
import config from '../config';
import { getStoredToken } from '../utils/storage';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: config.API_URL,
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
apiClient.interceptors.request.use(
    async (requestConfig) => {
        const token = await getStoredToken();
        if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.data);
            throw new Error(error.response.data.error || 'Server error');
        } else if (error.request) {
            // Network error
            console.error('Network Error:', error.request);
            throw new Error('Network error. Please check your connection.');
        } else {
            // Other error
            console.error('Error:', error.message);
            throw new Error(error.message);
        }
    }
);

class ApiService {
    /**
     * Register a new user
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise} - User data and token
     */
    async register(username, password) {
        const response = await apiClient.post('/auth/register', {
            username,
            password,
        });
        return response.data;
    }

    /**
     * Login user
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise} - User data and token
     */
    async login(username, password) {
        const response = await apiClient.post('/auth/login', {
            username,
            password,
        });
        return response.data;
    }

    /**
     * Search for users
     * @param {string} query - Search query
     * @returns {Promise} - Array of users
     */
    async searchUsers(query) {
        const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
        return response.data;
    }

    /**
     * Test protected endpoint
     * @returns {Promise} - Protected data
     */
    async testProtected() {
        const response = await apiClient.get('/protected');
        return response.data;
    }

    /**
     * Health check
     * @returns {Promise} - Server status
     */
    async healthCheck() {
        const response = await apiClient.get('/health');
        return response.data;
    }
}

export default new ApiService();
