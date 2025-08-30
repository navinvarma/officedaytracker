# Office Day Tracker 📅

A mobile application built with React Native and Expo for tracking office attendance with calendar integration, event management, and attendance statistics.

## 📊 Repository Stats

[![GitHub stars](https://img.shields.io/github/stars/navinvarma/officedaytracker?style=social)](https://github.com/navinvarma/officedaytracker/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/navinvarma/officedaytracker?style=social)](https://github.com/navinvarma/officedaytracker/network/members)
[![GitHub issues](https://img.shields.io/github/issues/navinvarma/officedaytracker)](https://github.com/navinvarma/officedaytracker/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/navinvarma/officedaytracker)](https://github.com/navinvarma/officedaytracker/pulls)
[![GitHub license](https://img.shields.io/github/license/navinvarma/officedaytracker)](https://github.com/navinvarma/officedaytracker/blob/main/LICENSE)

[![React Native](https://img.shields.io/badge/React%20Native-0.73.0-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000000.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-29.7.0-green.svg)](https://jestjs.io/)

**⭐ Star this repo if you find it helpful!**

## 📋 Table of Contents

- [✨ Features](#-features) • [📸 Screenshots](#-screenshots) • [🚀 Quick Start](#-quick-start) • [🧪 Testing](#-testing) • [🛠️ Tech Stack](#️-tech-stack) • [📄 License](#-license)

## 🎯 Project Overview

**Office Day Tracker** is a modern React Native mobile application that transforms how you track your office attendance. Built with the latest Expo SDK and TypeScript, it features a beautiful calendar interface, comprehensive statistics, and seamless calendar integration.

### Key Features
- Custom calendar widget with date selection
- Calendar integration for event storage
- Past event management with delete functionality
- Monthly attendance statistics
- Real-time calendar highlighting

## 🚀 Getting Started

```bash
# Quick setup
git clone https://github.com/navinvarma/officedaytracker.git
cd officedaytracker
npm install
npx expo start

# Run tests
npm test

# Build for production
eas build --platform all
```

## ✨ Features

- **🗓️ Smart Calendar Widget**: Interactive monthly calendar with date selection and visual indicators
- **📱 One-Tap Logging**: Log office days directly to your default calendar with timezone handling
- **📊 Month Statistics**: Track working days vs. office days with attendance percentage
- **🗂️ Past Event Management**: View, navigate, and delete previously logged office days
- **🎨 Real-time Updates**: Calendar highlighting updates immediately after logging
- **📅 Historical Access**: Navigate and log office days for the past 6 months
- **⚡ Modern UI**: Clean interface with smooth animations and modal navigation

## 📸 Screenshots

Want to see the app in action? Check out our comprehensive screenshot gallery showcasing all the major features and UI components.

**[📱 View All Screenshots →](SCREENSHOTS.md)**

The screenshots demonstrate:
- Main interface and date selection
- Custom calendar widget with visual indicators
- Past office days management
- Month statistics and analytics
- Menu navigation and modal interactions

*Screenshots captured during late-night development sessions using Expo Go on Android.*

## 🚀 Quick Start

**Prerequisites**: Node.js 18+, npm, and [Expo Go app](https://expo.dev/client) on your mobile device

```bash
git clone https://github.com/navinvarma/officedaytracker.git
cd officedaytracker
npm install
npx expo start
```

Scan the QR code with Expo Go, grant calendar permissions, and start logging your office days! 🎉

## 📱 Manual Testing

**Core Features**: Log office days → Check calendar integration → Test date picker navigation → View past events → Check month statistics → Verify calendar highlighting

**Edge Cases**: Test permission denial, network issues, date boundaries, and duplicate logging scenarios

## 🏗️ Development Story

Built as a fun weekend project using React Native, Expo, and Cursor AI assistance. The result? A fully-featured office tracking app completed in just a few hours of focused coding - demonstrating how AI tooling can amplify human creativity and productivity! 🚀

## 🧪 Testing

**Coverage**: 74.43% with 36 passing tests
- **CalendarService**: 100% coverage (initialization, permissions, event management)
- **MainScreen**: 69.95% coverage (UI interactions, date handling, statistics)

```bash
npm test                    # Run all tests
npm run test:coverage      # Coverage report
```

## 🛠️ Tech Stack

**Core**: React Native, Expo SDK 53, TypeScript, Expo Calendar, Jest + Testing Library

**Architecture**: Single-screen app with modal navigation, custom calendar widget, and comprehensive test suite

## 🔮 Future Enhancements

Location-based logging • Team analytics • Custom categories • Export reports • Offline support

## 🤝 Contributing

Fork → Create feature branch → Add tests → Submit PR

## 📄 License

**GNU General Public License v3.0** - Free software with copyleft requirements. See [LICENSE](LICENSE) for details.

---

**Built with ❤️ using Cursor AI** - This project demonstrates the power of combining human creativity with AI assistance for rapid, high-quality development. What will you build next? 🚀

