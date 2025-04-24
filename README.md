# ClearSay

ClearSay is a pronunciation practice app that helps users improve their speech clarity through interactive exercises and real-time feedback.

## Features

- Letter & Number Practice: Practice pronouncing individual letters and numbers
- Custom Objects Practice: Create custom sets of words and phrases to practice
- Progress Tracking: Monitor your improvement over time
- Speech Recognition: Get real-time feedback on your pronunciation

## Getting Started

### Prerequisites

- Node.js
- Yarn or npm
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Expo Go app (for testing on physical devices)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn start
   ```
4. Follow the instructions in the terminal to run the app on your desired platform

## Development

The app is built with:
- React Native
- Expo
- TypeScript
- React Navigation
- MobX-State-Tree for state management

### Project Structure

```
app/
├── components/     # Reusable components
├── models/        # MobX-State-Tree models
├── navigators/    # Navigation configuration
├── screens/       # Screen components
├── services/      # API and other services
├── theme/         # Styling and themes
└── utils/         # Utility functions
```

## License

This project is licensed under the MIT License.