# Unified App + CMS Implementation Guide

## Current Status

The iPrayUST app is experiencing Firebase permission errors that need to be resolved before implementing the CMS system. Here's the current situation and recommended solution.

## Immediate Issues to Fix

### 1. Firebase Permission Errors
- **Error**: `FirebaseError: Missing or insufficient permissions`
- **Cause**: App trying to access collections without proper Firestore rules
- **Status**: Partially resolved (appConfig rules added, but errors persist)

### 2. Authentication Issues
- **Error**: `Firebase: Error (auth/invalid-credential)`
- **Cause**: Authentication configuration or credential issues
- **Impact**: Users cannot sign in properly

## Recommended Implementation Strategy

### Phase 1: Fix Current App Issues (Priority: HIGH)

1. **Deploy Proper Firestore Rules**
   - Use the current working rules that allow public read access
   - Ensure all collections used by the app have proper permissions
   - Test thoroughly before proceeding to CMS integration

2. **Fix Authentication Issues**
   - Verify Firebase Auth configuration
   - Check service account credentials
   - Test user registration and login flows

3. **Verify Data Structure**
   - Confirm all required documents exist (appConfig/main, etc.)
   - Test prayer loading and user functionality
   - Ensure offline capabilities work properly

### Phase 2: Prepare for CMS Integration (Priority: MEDIUM)

1. **Create Admin User System**
   - Set up `admins` collection
   - Create initial admin users
   - Implement admin authentication flow

2. **Implement Clean Document Naming**
   - Update populate scripts to use readable document IDs
   - Create migration scripts for existing data
   - Update app code to handle both naming conventions

3. **Create CMS-Compatible Rules**
   - Use the provided prompt to generate unified rules
   - Test rules with both app and CMS requirements
   - Implement gradual rollout strategy

### Phase 3: CMS Development (Priority: LOW)

1. **Build CMS Interface**
   - Create admin dashboard
   - Implement content management features
   - Add user management capabilities

2. **Testing and Deployment**
   - Test both systems simultaneously
   - Implement monitoring and logging
   - Create backup and recovery procedures

## Immediate Action Items

### 1. Fix Current Firestore Rules

Replace the current rules with these tested rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for app content
    match /appConfig/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    match /prayerCategories/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    match /prayers/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    match /versesOfTheDay/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    match /verses/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    // User-specific data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    match /users/{userId}/bookmarks/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/prayerHistory/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public stats and notifications
    match /userStats/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    match /userRecent/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    match /notifications/{document} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    
    // Analytics (admin only)
    match /analytics/{document} {
      allow read, write: if false; // Admin SDK only
    }
  }
}
```

### 2. Test Authentication

Run these commands to verify Firebase setup:

```bash
# Check Firebase project status
firebase projects:list

# Verify current project
firebase use

# Test Firestore rules
firebase firestore:rules:get

# Check authentication settings
firebase auth:export users.json --project your-project-id
```

### 3. Monitor App Status

After deploying the rules:
1. Restart the app (`npm start`)
2. Test user registration and login
3. Verify prayer loading works
4. Check console for any remaining errors

## CMS Integration Prompt

Once the app is stable, use the `CMS_UNIFIED_RULES_PROMPT.md` file to generate compatible Firestore rules that support both the app and CMS system.

## Success Criteria

### Phase 1 Complete When:
- [ ] No Firebase permission errors in app
- [ ] User authentication works properly
- [ ] All app features function correctly
- [ ] App loads prayers and content successfully

### Phase 2 Complete When:
- [ ] Admin user system is operational
- [ ] Clean document naming is implemented
- [ ] Unified Firestore rules are deployed and tested

### Phase 3 Complete When:
- [ ] CMS interface is functional
- [ ] Both app and CMS work simultaneously
- [ ] All content management features are operational

## Risk Mitigation

1. **Always backup data** before making rule changes
2. **Test in development** before deploying to production
3. **Monitor app performance** after each change
4. **Have rollback plan** ready for each deployment
5. **Document all changes** for future reference

This phased approach ensures the app remains functional while gradually implementing the CMS system.