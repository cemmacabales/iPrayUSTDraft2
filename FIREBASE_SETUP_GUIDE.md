# Firebase Setup Guide for UST Prayer Library

This guide provides complete instructions for setting up Firebase to support all features of the UST Prayer Library app.

## 🔥 Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `ust-prayer-library` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create Analytics account
6. Click "Create project"

### 2. Enable Required Services

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Optionally enable **Google** sign-in for easier access

#### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll add security rules later)
4. Select your preferred location (closest to your users)

#### Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose **Start in test mode**
4. Select same location as Firestore

#### Cloud Functions (Optional)
1. Go to **Functions**
2. Click "Get started" if you plan to use server-side logic

#### Analytics (Optional)
1. Go to **Analytics**
2. Enable if you want user engagement tracking

### 3. Register Your App

1. Click the **Web** icon (</>) in project overview
2. Enter app nickname: `UST Prayer Library`
3. Check "Also set up Firebase Hosting" if you want web deployment
4. Click "Register app"
5. Copy the configuration object

## ⚙️ Configuration

### Update firebase.ts

Replace the placeholder values in `/config/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "ust-prayer-library.firebaseapp.com",
  projectId: "ust-prayer-library",
  storageBucket: "ust-prayer-library.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX" // If Analytics enabled
};
```

## 📊 Database Structure

### Required Collections

Create these collections in Firestore with the following structure:

#### 1. `users` Collection
```javascript
// Document ID: {userId}
{
  id: "user123",
  displayName: "John Doe",
  email: "john.doe@ust.edu.ph",
  firstName: "John",
  lastName: "Doe",
  studentNumber: "2021-12345", // Optional
  bookmarks: ["prayer1", "prayer2"], // Array of prayer IDs
  preferences: {
    morningReminder: true,
    eveningReminder: false,
    reminderTime: "08:00"
  },
  expoPushToken: "ExponentPushToken[...]", // For notifications
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

#### 2. `prayerCategories` Collection
```javascript
// Document ID: category slug (e.g., "devotional")
{
  id: "devotional",
  title: "Devotional Prayers",
  description: "Angelus, Regina Coeli, Prayers Before/After Mass, Before Study, Before Exams.",
  icon: "heart", // Icon name for UI
  order: 1, // Display order
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

#### 3. `prayers` Collection
```javascript
// Document ID: prayer slug (e.g., "angelus")
{
  id: "angelus",
  title: "The Angelus",
  content: "V. The Angel of the Lord declared unto Mary...\n[Full prayer text]",
  category: "devotional", // References prayerCategories
  subcategory: "marian", // Optional
  description: "Traditional prayer commemorating the Annunciation",
  tags: ["mary", "incarnation", "traditional"], // Optional
  image: "https://example.com/images/angelus.jpg", // Optional: URL to prayer image for CMS
  order: 1, // Order within category
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

#### 4. `userStats` Collection
```javascript
// Document ID: {userId}
{
  userId: "user123",
  prayerCounts: {
    "angelus": 15,
    "before-study": 8,
    "guardian-angel": 22
  },
  totalPrayers: 45,
  streakDays: 7, // Consecutive days of prayer
  lastPrayerDate: "2024-01-15",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

#### 5. `userRecent` Collection
```javascript
// Document ID: {userId}
{
  userId: "user123",
  prayers: ["angelus", "before-study", "guardian-angel"], // Last 10 prayers
  updatedAt: serverTimestamp()
}
```

#### 6. `versesOfTheDay` Collection
```javascript
// Document ID: date string (e.g., "2024-01-15")
{
  id: "2024-01-15",
  verse: "For I know the plans I have for you, declares the Lord...",
  reference: "Jeremiah 29:11",
  date: "2024-01-15",
  createdAt: serverTimestamp()
}
```

#### 7. `suggested_prayers` Collection (🆕 CMS-Managed)
```javascript
// Document ID: {suggestionId}
{
  id: "morning-suggestion-1",
  title: "Morning Prayer Starter",
  description: "Perfect way to start your day with prayer",
  prayerId: "before-study", // References prayer in main collection
  timeContext: "morning", // morning, evening, study, exam, anytime
  tags: ["morning", "study", "daily"],
  image: "https://images.unsplash.com/photo-id?w=400&h=300",
  order: 1,
  isActive: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Optional Collections

#### 7. `notifications` Collection (for push notification logs)
```javascript
{
  id: "notif123",
  userId: "user123",
  title: "Morning Prayer Reminder",
  body: "Start your day with prayer",
  type: "reminder", // reminder, announcement, etc.
  sent: true,
  sentAt: serverTimestamp(),
  createdAt: serverTimestamp()
}
```

## 🔒 Security Rules

### Firestore Security Rules

Replace the default rules in **Firestore Database** > **Rules** with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Prayer categories are read-only for authenticated users
    match /prayerCategories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write (use Firebase Admin SDK)
    }
    
    // Prayers are read-only for authenticated users
    match /prayers/{prayerId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write (use Firebase Admin SDK)
    }
    
    // User stats are private to each user
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User recent prayers are private to each user
    match /userRecent/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Verses of the day are read-only for all authenticated users
    match /versesOfTheDay/{date} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write
    }
    
    // Notifications are read-only for the target user
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow write: if false; // Only server can write
    }
  }
}
```

### Storage Security Rules

In **Storage** > **Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload profile images
    match /users/{userId}/profile/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public prayer images (read-only)
    match /prayers/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins
    }
  }
}
```

## 📱 Initial Data Population

### 1. Automated Data Population

The project includes an automated script to populate your Firestore database with initial prayer data.

#### Prerequisites
1. Install Firebase Admin SDK:
   ```bash
   npm install
   ```

2. Download your service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file to a secure location

3. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/serviceAccountKey.json"
   ```

#### Run the Population Script
```bash
npm run populate-firebase
```

This script will automatically create:
- **Prayer Categories**: All categories from `constants/prayers.ts` with proper structure
- **Prayers**: All individual prayers organized by category
- **Sample Verses**: Initial verse of the day entries

### 2. Manual Data Population (Alternative)

If you prefer to populate data manually:

1. Go to **Firestore Database** > **Data**
2. Create collections manually using the structure below
3. Use the sample data script as reference

#### Sample Data Script

Create a Node.js script to populate initial data:

```javascript
const admin = require('firebase-admin');
const { PRAYER_CATEGORIES } = require('./constants/prayers');

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'your-project-id'
});

const db = admin.firestore();

async function populateData() {
  // Add prayer categories
  for (const category of PRAYER_CATEGORIES) {
    await db.collection('prayerCategories').doc(category.id).set({
      id: category.id,
      title: category.title,
      description: category.description,
      icon: category.icon,
      order: PRAYER_CATEGORIES.indexOf(category) + 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add prayers for this category
    for (const prayer of category.prayers) {
      await db.collection('prayers').doc(prayer.id).set({
        id: prayer.id,
        title: prayer.title,
        content: prayer.content,
        category: prayer.category,
        subcategory: prayer.subcategory || null,
        description: prayer.description || null,
        tags: prayer.tags || [],
        order: category.prayers.indexOf(prayer) + 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  
  console.log('Data populated successfully!');
}

populateData().catch(console.error);
```

## 📊 Database Indexes

### Automated Index Deployment

The project includes optimized Firestore indexes in `firestore.indexes.json`:

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

### Manual Index Creation

Alternatively, create these indexes in **Firestore Database** > **Indexes**:

1. **prayers** collection:
   - `category` (ascending) + `order` (ascending)
   - `category` (ascending) + `title` (ascending)
   - `tags` (array-contains) + `category` (ascending)

2. **prayerCategories** collection:
   - `order` (ascending)

3. **versesOfTheDay** collection:
   - `date` (descending)

4. **userStats** collection:
   - `userId` (ascending) + `totalPrayers` (descending)

5. **userRecent** collection:
   - `userId` (ascending) + `updatedAt` (descending)

## 🧪 Testing

### 1. Test Authentication
- Create a test user account
- Verify sign-in/sign-out functionality
- Check user document creation
- Test email verification requirements

### 2. Test Data Access
- Verify prayer categories load correctly
- Test bookmark functionality
- Check prayer statistics tracking
- Validate recent prayers functionality

### 3. Test Security Rules
- Ensure users can't access other users' data
- Verify prayer content is read-only
- Test unauthenticated access is blocked
- Validate input sanitization

### 4. Test Performance
- Verify query performance with indexes
- Test offline functionality
- Check data caching behavior

## 🔒 Security Rules Deployment

### Automated Rules Deployment

The project includes comprehensive security rules in `firestore.rules`:

```bash
# Deploy security rules
firebase deploy --only firestore:rules
```

### Manual Rules Setup

Alternatively, copy the contents of `firestore.rules` to **Firestore Database** > **Rules** in Firebase Console.

### Key Security Features
- User data isolation (users can only access their own data)
- Read-only access to prayer content for authenticated users
- Email verification requirements
- Input validation and sanitization
- Admin-only write access for prayer content

## 🚀 Production Deployment

### 1. Firebase CLI Setup

Install and configure Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init
```

### 2. Complete Deployment

Deploy all Firebase configurations using the provided npm scripts:

```bash
# Deploy everything
npm run firebase:deploy

# Or deploy specific components
npm run firebase:deploy:rules    # Deploy security rules
npm run firebase:deploy:indexes  # Deploy database indexes

# Manual Firebase CLI commands (alternative)
firebase deploy --only firestore:rules,storage
firebase deploy --only firestore:indexes
firebase deploy --only functions  # if using Cloud Functions
```

### 2.1. Development with Emulators

For local development and testing:

```bash
# Start Firebase emulators
npm run firebase:emulators

# Or manually
firebase emulators:start
```

This will start:
- **Firestore Emulator** on port 8080
- **Authentication Emulator** on port 9099
- **Storage Emulator** on port 9199
- **Functions Emulator** on port 5001 (if functions are configured)
- **Emulator UI** on port 4000

### 3. Environment Variables

For production, use environment-specific configurations:

```bash
# .env.production
FIREBASE_API_KEY=your-production-api-key
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_AUTH_DOMAIN=your-production-project-id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-production-project-id.appspot.com
# ... other config values
```

### 4. Performance Optimization
- Enable Firestore offline persistence in the app
- Implement proper data caching strategies
- Use the provided Firestore indexes for optimal query performance
- Enable compression for large prayer texts
- Implement pagination for large datasets

### 5. Monitoring & Analytics
- Set up Firebase Performance Monitoring
- Configure Crashlytics for error tracking
- Monitor authentication and database usage
- Set up alerts for quota limits
- Track user engagement with Firebase Analytics

## 📞 Support

For issues with this setup:
1. Check Firebase Console for error logs
2. Verify security rules are correctly applied
3. Ensure all required services are enabled
4. Check network connectivity and API quotas

---

**Note**: This configuration supports all features of the UST Prayer Library including user authentication, prayer management, bookmarks, statistics tracking, and push notifications.