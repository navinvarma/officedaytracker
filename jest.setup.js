// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    // Uncomment to see console.log in tests
    // log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Mock AsyncStorage - not needed for this app
// jest.mock('@react-native-async-storage/async-storage', () =>
//   require('@react-native-async-storage/async-storage/jest/async-storage-mock')
// );

// Mock expo-constants
jest.mock('expo-constants', () => ({
    default: {
        expoConfig: {
            extra: {
                eas: {
                    projectId: 'test-project-id'
                }
            }
        }
    }
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
    StatusBar: 'StatusBar'
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
    enableScreens: jest.fn()
}));

// React Native mocking is handled by jest-expo preset

// Global test timeout
jest.setTimeout(10000);

// Mock Date.now() for consistent testing
const mockDate = new Date('2024-01-15T12:00:00Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock Intl.DateTimeFormat
global.Intl = {
    ...global.Intl,
    DateTimeFormat: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'UTC' })
    }))
};
