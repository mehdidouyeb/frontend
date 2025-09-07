/**
 * Main App Component
 * Purpose: Root component that initializes the entire app
 * Why: Entry point that sets up navigation and global providers
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
