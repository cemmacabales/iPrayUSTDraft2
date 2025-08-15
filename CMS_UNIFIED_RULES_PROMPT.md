# CMS AI Prompt for Unified Firestore Rules

Please create Firestore security rules that are compatible with both the iPrayUST mobile app and the CMS system. The rules must maintain backward compatibility with the existing app while enabling CMS functionality.

## Required Collections and Permissions

### Core App Collections (Must Maintain Current Behavior)

1. **appConfig** - App configuration data
   - Read: Public (no authentication required)
   - Write: Admin SDK only (write: false)
   - Documents: `main` (contains logo, appName, version)

2. **prayerCategories** - Prayer category data
   - Read: Public (no authentication required)
   - Write: Admin SDK only (write: false)

3. **prayers** - All prayer content including suggested prayers
   - Read: Public (no authentication required)
   - Write: Admin SDK only (write: false)
   - Fields: id, title, content, category, subcategory, description, tags, order, isSuggested, createdAt, updatedAt

4. **versesOfTheDay** - Daily verses
   - Read: Public (no authentication required)
   - Write: Admin SDK only (write: false)

5. **verses** - Bible verses collection
   - Read: Public (no authentication required)
   - Write: Admin SDK only (write: false)

6. **users** - User profiles
   - Read: User can read their own document only
   - Write: User can write their own document only
   - Create: Allow user creation with email verification

7. **users/{userId}/bookmarks** - User bookmarks subcollection
   - Read/Write: User can access their own bookmarks only

8. **users/{userId}/prayerHistory** - User prayer history subcollection
   - Read/Write: User can access their own history only

9. **userStats** - User statistics
   - Read: Public (no authentication required)
   - Write: Admin SDK only (write: false)

10. **userRecent** - Recent user activity
    - Read: Public (no authentication required)
    - Write: Admin SDK only (write: false)

11. **notifications** - App notifications
    - Read: Public (no authentication required)
    - Write: Admin SDK only (write: false)

12. **analytics** - App analytics data
    - Read: Admin SDK only
    - Write: Admin SDK only (write: false)

### CMS-Specific Requirements

1. **admins** - CMS admin users (if needed for CMS)
   - Read: Admin users only
   - Write: Super admin only
   - Structure: { email, role, permissions, createdAt }

2. **settings** - CMS settings (if needed)
   - Read: Admin users only
   - Write: Admin users only

## Authentication Requirements

- **Public Content**: No authentication required for reading prayers, categories, verses, app config
- **User Content**: Firebase Auth required for user-specific data
- **Admin Content**: Admin authentication required for CMS operations
- **Write Operations**: Most writes handled by Admin SDK (write: false in rules)

## Key Constraints

1. **Backward Compatibility**: The mobile app must continue working without any code changes
2. **Public Access**: Unauthenticated users must be able to read prayers and app content
3. **Admin SDK**: Current app uses Admin SDK for data population and updates
4. **User Registration**: Must support the existing user creation flow
5. **Clean Document IDs**: Support both auto-generated and clean document naming

## Functions to Include

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return request.auth != null && request.auth.uid == userId;
}

function isAdmin() {
  return request.auth != null && 
         exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}

function isValidUser() {
  return request.auth != null && 
         request.auth.token.email_verified == true;
}
```

## Expected Output

Provide complete Firestore security rules that:
1. Maintain all existing app functionality
2. Enable CMS admin operations
3. Follow security best practices
4. Include proper validation for document creation/updates
5. Support both authentication modes (public + authenticated)

The rules should be production-ready and thoroughly tested for both use cases.