# iPrayUST - Digital Prayer Companion

A mobile application designed to support the spiritual growth and devotional practices of students and faculty at the University of Santo Tomas.

## Features

### Core Features
- **Home Page (Booklet Style)**: Digital "cover" with welcoming artwork and smooth page transitions
- **Prayer Library**: Organized by categories with dropdown navigation
- **Daily Reminders**: Configurable prayer reminders with verse of the day
- **Account Management**: User authentication and bookmark functionality

### Prayer Categories
- **Introductory Content**: Welcome, Catechesis on Liturgy, Mass Guide
- **Devotional Prayers**: Angelus, Regina Coeli, Study/Exam Prayers
- **Protection & Intercessory**: Guardian Angel, St. Michael, St. Joseph, St. Dominic
- **Consecrations**: Sacred Heart of Jesus, Immaculate Heart of Mary
- **Marian Devotions**: Holy Rosary Guide
- **Other Important Prayers**: Confession Guide, Act of Contrition, Dominican Blessing

## Technical Stack

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Routing**: Expo Router (declarative routing)
- **Styling**: React Native StyleSheet
- **Fonts**: @expo-google-fonts/inter
- **Icons**: @expo/vector-icons

### State Management
- React Context + useState for global state
- AsyncStorage for local data persistence

### Development Tools
- **Live Testing**: Expo Go
- **Build**: EAS Build
- **Updates**: EAS Update
- **Debugging**: Expo DevTools, React Native DevTools

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iPrayUST
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

### Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Build for production
npm run build

# Eject from Expo (if needed)
npm run eject
```

## Project Structure

```
iPrayUST/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home page
│   ├── prayers.tsx        # Prayer library
│   ├── reminders.tsx      # Daily reminders
│   ├── account.tsx        # User account
│   └── prayer-detail.tsx  # Individual prayer view
├── components/            # Reusable components
├── constants/             # App constants and data
│   └── prayers.ts         # Prayer content
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── assets/                # Images, fonts, etc.
├── constants/styles.ts     # App styles and colors
├── babel.config.js        # Babel configuration
└── app.json              # Expo configuration
```

## Design Principles

### Accessibility
- Scalable fonts for readability
- High-contrast text and UI elements
- Semantic UI structure for screen readers
- Simple tap targets for navigation

### User Experience
- **Simplicity**: Minimalist UI focusing on devotion
- **Speed**: Optimized for fast loading
- **Maintainability**: Easy content updates
- **Mobile-first**: Responsive design for all devices

## Content Management

### Prayer Content
- All prayers are stored in `constants/prayers.ts`
- Organized by categories with metadata
- Easy to update and maintain
- Supports descriptions and tags

### Verse of the Day
- Configurable daily verse
- Can be updated by admin
- Displays prominently on home and reminders pages

## Future Enhancements

### Backend Integration (Next Session)
- Firebase Firestore for prayer content
- Firebase Authentication for user accounts
- Firebase Analytics for user engagement
- Offline data synchronization with AsyncStorage

## 🔥 Firebase Collections

- **users**: User profiles and authentication data
- **prayerCategories**: Prayer categories with metadata
- **prayers**: Individual prayers with content and images
- **suggested_prayers**: 🆕 CMS-managed prayer suggestions with time-based filtering
- **userStats**: User prayer statistics and tracking
- **userRecent**: Recent prayer history
- **versesOfTheDay**: Daily inspirational verses

### Additional Features
- Bible integration via API.bible
- Offline mode with content caching
- Prayer timer functionality
- Social sharing features
- Prayer journal/notes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed for the University of Santo Tomas community.

## Support

For technical support or questions, please contact the development team.

---

**"Pray without ceasing" — 1 Thessalonians 5:17**
