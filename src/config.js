/**
 * App Configuration
 * Purpose: Centralize all app settings and constants
 * Why: One place to manage all configuration values
 */

// Get the local IP address for development
// In production, this would be your actual server URL
const getApiUrl = () => {
    // For iOS Simulator and Android Emulator, localhost works
    // For physical devices, you need your computer's IP address
    return 'http://100.66.11.219:3000';
};

const config = {
    // API Configuration
    API_URL: getApiUrl(),

    // WebSocket Configuration
    SOCKET_URL: getApiUrl(),

    // Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'auth_token',
        USER: 'user_data'
    },

    // App Constants
    APP_NAME: 'Simple Chat',

    // Validation Rules
    VALIDATION: {
        MIN_USERNAME_LENGTH: 3,
        MIN_PASSWORD_LENGTH: 6,
        MAX_MESSAGE_LENGTH: 1000
    }
};

export { config };
export default config;
