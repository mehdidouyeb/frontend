/**
 * Login Screen
 * Purpose: Handle user login with username and password
 * Why: Focused component for authentication UI and logic
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import apiService from '../services/apiService';
import { storeToken, storeUser, clearAllStorage } from '../utils/storage';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    /**
     * Handle login form submission
     */
    const handleLogin = async () => {
        // Validate input
        if (!username.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }

        if (username.length < config.VALIDATION.MIN_USERNAME_LENGTH) {
            Alert.alert('Error', `Username must be at least ${config.VALIDATION.MIN_USERNAME_LENGTH} characters long`);
            return;
        }

        if (password.length < config.VALIDATION.MIN_PASSWORD_LENGTH) {
            Alert.alert('Error', `Password must be at least ${config.VALIDATION.MIN_PASSWORD_LENGTH} characters long`);
            return;
        }

        setLoading(true);

        try {
            // Call login API
            const response = await apiService.login(username.trim(), password);

            // Store token and user data
            await storeToken(response.token);
            await storeUser(response.user);

            // Login user (triggers navigation to Main stack)
            await login();

        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Navigate to register screen
     */
    const goToRegister = () => {
        navigation.navigate('Register');
    };

    /**
     * Reset app storage (for testing PostgreSQL)
     */
    const handleResetApp = async () => {
        Alert.alert(
            'Reset App',
            'This will clear all stored data (tokens, user data). Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearAllStorage();
                            Alert.alert('Success', 'App storage cleared! You can now test fresh.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear storage: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>{config.APP_NAME}</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={goToRegister}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account? Sign up
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleResetApp}
                        disabled={loading}
                    >
                        <Text style={styles.resetText}>
                            🧹 Reset App (Clear Storage)
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    linkText: {
        color: '#007AFF',
        fontSize: 16,
    },
    resetButton: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 20,
        backgroundColor: '#ff3333',
        borderRadius: 6,
        paddingHorizontal: 12,
    },
    resetText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default LoginScreen;
