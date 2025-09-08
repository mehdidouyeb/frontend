/**
 * Main App Component
 * Purpose: Root component that initializes the entire app
 * Why: Entry point that sets up navigation and global providers
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorMessage}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.toString()}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
