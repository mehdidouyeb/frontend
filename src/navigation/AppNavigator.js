/**
 * App Navigator
 * Purpose: Configure navigation between all app screens
 * Why: Centralizes navigation logic and screen definitions
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';

// Import context
import { AuthProvider, useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

/**
 * Auth Stack - screens for non-authenticated users
 */
const AuthStack = () => (
    <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
            headerShown: false, // Hide header for auth screens
        }}
    >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

/**
 * Main Stack - screens for authenticated users
 */
const MainStack = () => (
    <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
            headerShown: false, // We use custom headers
        }}
    >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
);

/**
 * Loading Screen Component
 */
const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
    </View>
);

/**
 * Navigation Component (uses AuthContext)
 */
const AppNavigation = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading screen while checking auth status
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

/**
 * Main App Navigator with AuthProvider
 */
const AppNavigator = () => {
    return (
        <AuthProvider>
            <AppNavigation />
        </AuthProvider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});

export default AppNavigator;
