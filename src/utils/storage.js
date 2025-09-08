/**
 * Storage Utility
 * Purpose: Handle local storage operations (token, user data)
 * Why: Centralizes all storage operations with error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

/**
 * Store JWT token
 * @param {string} token - JWT token to store
 */
export const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem(config.STORAGE_KEYS.TOKEN, token);
    } catch (error) {
        console.error('Error storing token:', error);
        throw new Error('Failed to store authentication token');
    }
};

/**
 * Get stored JWT token
 * @returns {Promise<string|null>} - JWT token or null
 */
export const getStoredToken = async () => {
    try {
        const token = await AsyncStorage.getItem(config.STORAGE_KEYS.TOKEN);
        return token;
    } catch (error) {
        console.error('Error getting token:', error);
        // Fallback: return null instead of throwing
        return null;
    }
};

/**
 * Store user data
 * @param {Object} user - User object to store
 */
export const storeUser = async (user) => {
    try {
        await AsyncStorage.setItem(config.STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
        console.error('Error storing user:', error);
        throw new Error('Failed to store user data');
    }
};

/**
 * Get stored user data
 * @returns {Promise<Object|null>} - User object or null
 */
export const getStoredUser = async () => {
    try {
        const userData = await AsyncStorage.getItem(config.STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

/**
 * Clear all stored data (logout)
 */
export const clearStorage = async () => {
    try {
        await AsyncStorage.multiRemove([
            config.STORAGE_KEYS.TOKEN,
            config.STORAGE_KEYS.USER
        ]);
    } catch (error) {
        console.error('Error clearing storage:', error);
        throw new Error('Failed to clear stored data');
    }
};

/**
 * Check if user is logged in
 * @returns {Promise<boolean>} - True if user has valid token
 */
export const isLoggedIn = async () => {
    try {
        const token = await getStoredToken();
        const user = await getStoredUser();
        return !!(token && user);
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
};

/**
 * Clear ALL AsyncStorage data (complete reset)
 */
export const clearAllStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log('All storage cleared successfully');
    } catch (error) {
        console.error('Error clearing all storage:', error);
        throw new Error('Failed to clear all storage');
    }
};
