# Simple Chat - React Native Frontend

React Native mobile app for the Simple Chat application.

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Start the development server:**

```bash
npm start
```

3. **Run on device/simulator:**

- **iOS Simulator:** Press `i` in the terminal
- **Android Emulator:** Press `a` in the terminal  
- **Physical Device:** Install Expo Go app and scan the QR code

## Testing the App

### Prerequisites

- Backend server running on `http://localhost:3000`
- For physical devices, update the API URL in `src/config.js` to your computer's IP address

### Test Flow

1. **Register:** Create a new account with username and password
2. **Login:** Sign in with your credentials
3. **Home Screen:** Verify you reach the welcome screen
4. **Logout:** Test the logout functionality

## Project Structure

```
src/
├── config.js              # App configuration
├── navigation/
│   └── AppNavigator.js     # Navigation setup
├── screens/
│   ├── LoginScreen.js      # Login screen
│   ├── RegisterScreen.js   # Registration screen
│   └── HomeScreen.js       # Home screen (placeholder)
├── services/
│   └── apiService.js       # HTTP API calls
└── utils/
    └── storage.js          # Local storage utilities
```

## Features Implemented (Phase 3)

✅ **User Registration** - Create new accounts  
✅ **User Login** - Authenticate existing users  
✅ **Token Storage** - Persistent authentication  
✅ **Navigation** - Screen transitions  
✅ **Input Validation** - Form validation  
✅ **Error Handling** - User-friendly error messages  
✅ **Loading States** - Visual feedback during operations  

## Next Phase

Phase 4 will add:

- User search functionality
- Chat interface
- Real-time messaging with WebSockets

## Configuration

Update `src/config.js` for your environment:

- Change `API_URL` for physical device testing
- Modify validation rules as needed
