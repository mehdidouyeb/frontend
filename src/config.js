/**
 * App Configuration
 * Purpose: Centralize all app settings and constants
 * Why: One place to manage all configuration values
 */

// Get the API URL for different environments
const getApiUrl = () => {
    // Production: Railway cloud backend (works from anywhere!)
    const PRODUCTION_URL = 'https://backend-production-0b88.up.railway.app';

    // Development: Local backend (for development only)
    const DEV_URL = 'http://100.66.11.219:3000';

    // Use production URL by default (cloud backend)
    return PRODUCTION_URL;

    // To switch back to local development, change to:
    // return DEV_URL;
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
