/**
 * Test Setup Script
 * Purpose: Verify that our React Native app setup is working
 * Why: Quick validation before running on device/simulator
 */

const config = require('./config-test.js');

console.log('🧪 Testing React Native App Setup...\n');

// Test 1: Configuration
console.log('✅ Config loaded successfully');
console.log(`   API URL: ${config.config.API_URL}`);
console.log(`   App Name: ${config.config.APP_NAME}\n`);

// Test 2: Dependencies
try {
    require('@react-navigation/native');
    console.log('✅ React Navigation installed');
} catch (error) {
    console.log('❌ React Navigation missing');
}

try {
    require('axios');
    console.log('✅ Axios installed');
} catch (error) {
    console.log('❌ Axios missing');
}

try {
    require('@react-native-async-storage/async-storage');
    console.log('✅ AsyncStorage installed');
} catch (error) {
    console.log('❌ AsyncStorage missing');
}

try {
    require('socket.io-client');
    console.log('✅ Socket.io client installed');
} catch (error) {
    console.log('❌ Socket.io client missing');
}

console.log('\n🎉 Setup verification complete!');
console.log('\nNext steps:');
console.log('1. Make sure your backend server is running on port 3000');
console.log('2. Run "npm start" to start Expo development server');
console.log('3. Use Expo Go app or simulator to test the app');
console.log('4. Try registering a new user and logging in');
