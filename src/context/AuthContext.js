/**
 * Authentication Context
 * Purpose: Manage authentication state across the entire app
 * Why: Allows any component to check/update authentication status
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isLoggedIn, clearStorage } from '../utils/storage';
import socketService from '../services/socketService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Check authentication status on app start
     */
    useEffect(() => {
        checkAuthStatus();
    }, []);

    /**
     * Check if user is logged in
     */
    const checkAuthStatus = async () => {
        try {
            const loggedIn = await isLoggedIn();
            setIsAuthenticated(loggedIn);
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login user (call after successful authentication)
     */
    const login = async () => {
        setIsAuthenticated(true);
        // Force socket reconnection with new user credentials
        try {
            await socketService.forceReconnect();
        } catch (error) {
            console.log('Socket reconnection failed, will retry when needed:', error);
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            // Disconnect socket before clearing storage
            socketService.disconnect();
            await clearStorage();
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const value = {
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
