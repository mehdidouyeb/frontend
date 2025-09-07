/**
 * Test Configuration (CommonJS version)
 * Purpose: Config file for Node.js testing
 */

const getApiUrl = () => {
    return 'http://localhost:3000';
};

const config = {
    API_URL: getApiUrl(),
    SOCKET_URL: getApiUrl(),
    STORAGE_KEYS: {
        TOKEN: 'auth_token',
        USER: 'user_data'
    },
    APP_NAME: 'Simple Chat',
    VALIDATION: {
        MIN_USERNAME_LENGTH: 3,
        MIN_PASSWORD_LENGTH: 6,
        MAX_MESSAGE_LENGTH: 1000
    }
};

module.exports = { config };
