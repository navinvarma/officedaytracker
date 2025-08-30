# Office Day Tracker 📅

A feature-rich mobile application built with React Native and Expo that helps you track your office attendance with a beautiful calendar interface, past event management, and comprehensive statistics.

> **Built with ❤️ and AI assistance** - This app was vibe-coded using Cursor in just a couple of hours on a Saturday afternoon. It's amazing what you can build when you combine human creativity with AI tooling!

## ✨ Features

### 🎯 Core Functionality
- **Smart Date Picker**: Custom calendar widget for selecting any date (past 6 months)
- **Office Day Logging**: One-tap logging of office days to your default calendar
- **Past Event Management**: View and delete previously logged office days
- **Month Statistics**: Track working days, office days, and attendance percentage
- **Real-time Updates**: Calendar highlighting updates immediately after logging

### 🗓️ Calendar Integration
- **Full Calendar Widget**: Interactive monthly calendar with date selection
- **Visual Indicators**: Different colors for today, selected dates, and office days
- **Month Navigation**: Navigate between months to log historical office days
- **Quick Presets**: "Today" and "Yesterday" buttons for instant selection

### 📊 Analytics & Insights
- **Working Day Calculation**: Automatically counts Mon-Fri working days per month
- **Attendance Tracking**: Shows how many office days vs. working days
- **Percentage Metrics**: Attendance rate calculation for the current month
- **Historical Data**: Access to the last 6 months of office day events

### 🎨 User Experience
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Modal System**: Organized menus for different app sections
- **Responsive Design**: Works seamlessly on both iOS and Android
- **Permission Handling**: Graceful calendar permission requests

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go app** on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation & Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd officedaytracker
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Test on your device**
   - Install **Expo Go** from your device's app store
   - Scan the QR code displayed in your terminal
   - Grant calendar permissions when prompted
   - Start logging your office days! 🎉

## 📱 Manual Testing Guide

### Testing the Core Features

#### 1. **Basic Office Day Logging**
- Tap the "Log Office Day" button
- Verify an "Office Day" event appears in your calendar
- Check that the event is marked as "all-day"

#### 2. **Date Picker Functionality**
- Tap the date button (shows current date)
- Navigate through months using ‹ and › buttons
- Select different dates and confirm
- Try the "Today" and "Yesterday" quick buttons

#### 3. **Past Date Logging**
- Open the date picker
- Navigate to a past month
- Select a past date and log an office day
- Verify it appears in your calendar on the correct date

#### 4. **Past Events Management**
- Tap the ☰ menu button
- Select "📅 Past Office Days"
- View your logged office days
- Test the delete functionality (🗑️ button)

#### 5. **Month Statistics**
- Tap the ☰ menu button
- Select "📊 Month Statistics"
- Verify working days, office days, and attendance percentage
- Log a new office day and check if stats update

#### 6. **Calendar Highlighting**
- Open the date picker
- Navigate to months with logged office days
- Verify office days are highlighted in light blue
- Check that today's date has distinct styling

### Testing Edge Cases
- **Permission Denial**: Deny calendar access and verify error handling
- **Network Issues**: Test with poor internet connection
- **Date Boundaries**: Try logging dates at month/year boundaries
- **Multiple Logs**: Attempt to log multiple office days on the same date

## 🏗️ Development Story

This app was built as a fun weekend project to explore modern React Native development with AI assistance. Using Cursor's AI capabilities, the development process was incredibly smooth:

- **Rapid Prototyping**: AI helped generate the initial app structure and calendar logic
- **UI/UX Design**: Collaborative design decisions with AI suggestions for modern mobile patterns
- **Testing Strategy**: Comprehensive unit test suite with AI-generated test cases
- **Bug Fixing**: Quick iteration and problem-solving with AI assistance

The result? A fully-featured office tracking app that would typically take weeks to build, completed in just a few hours of focused coding. It's a testament to how AI tooling can amplify human creativity and productivity! 🚀

## 🧪 Testing

### Unit Tests
The app includes a comprehensive test suite covering all major functionality:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

**Current Coverage**: 67% with 10 passing tests covering:
- Date logging functionality
- Past events retrieval
- Calendar highlighting
- Date validation
- Data consistency

### Manual Testing
- Test on both iOS and Android devices
- Verify calendar integration with real calendar apps
- Test permission flows and error handling
- Validate date calculations and month navigation

## 🛠️ Technical Architecture

### Tech Stack
- **React Native**: Cross-platform mobile development
- **Expo SDK 53**: Latest stable Expo version
- **TypeScript**: Type-safe development
- **Expo Calendar**: Native calendar integration
- **Jest + Testing Library**: Comprehensive testing

### Project Structure
```
src/
├── screens/
│   └── MainScreen.tsx          # Main app interface with all features
├── services/
│   └── CalendarService.ts      # Calendar operations
├── types/
│   └── index.ts               # TypeScript definitions
└── __tests__/
    └── MainScreen.test.tsx    # Comprehensive test suite
```

### Key Components
- **MainScreen**: Single-screen app with modal-based navigation
- **Calendar Widget**: Custom calendar implementation with date selection
- **Event Management**: CRUD operations for office day events
- **Statistics Engine**: Working day calculations and attendance metrics

## 📋 Permissions

The app requires:
- **Calendar Access**: To create, read, and delete office day events
- **Permissions are requested on first launch** with clear explanations

## 🚀 Building for Production

### Development Build
```bash
npx expo install --fix
npx expo start --dev-client
```

### Production Build
```bash
eas build --platform all
```

## 🔮 Future Enhancements

- **Location-based Logging**: Auto-detect when you're at the office
- **Team Analytics**: Compare attendance with colleagues
- **Custom Categories**: Different types of office activities
- **Export & Reporting**: Generate attendance reports
- **Offline Support**: Log office days without internet connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🆘 Support

- **Issues**: Check existing issues or create new ones
- **Discussions**: Use GitHub Discussions for questions
- **Contributions**: Pull requests are welcome!

---

**Built with ❤️ using Cursor AI** - This project demonstrates the power of combining human creativity with AI assistance for rapid, high-quality development. What will you build next? 🚀

