# CMS Clean Document Naming Guide

This guide explains how to implement and manage clean, readable document names in Firebase for the iPrayUST app, making CMS management much easier.

## 🎯 Overview

Instead of jumbled document IDs like `MfSZm1EWpZH2BXHaZmBP3CayoO2`, we now use clean, readable IDs like `morning-prayer-before-study` or `traditional-our-father`.

## 📋 Current Document Collections

### 1. Prayers Collection (`prayers`)
**Before:** `MfSZm1EWpZH2BXHaZmBP3CayoO2`
**After:** `traditional-our-father`, `morning-prayer-before-study`, `evening-angelus`

### 2. Prayer Categories Collection (`prayerCategories`)
**Before:** `XyZ123AbC456DeF789`
**After:** `traditional-prayers`, `devotional-prayers`, `student-prayers`

### 3. Suggested Prayers Collection (`suggested_prayers`)
**Before:** `QwE789RtY456UiO123`
**After:** `morning-study-prayer`, `evening-reflection`, `exam-preparation`

### 4. User Documents
**Recent Prayers:** `userRecent/{userId}` → `user-recent-{userId}`
**Bookmarks:** `userBookmarks/{userId}` → `user-bookmarks-{userId}`
**Stats:** `userStats/{userId}` → `user-stats-{userId}`

## 🛠️ Implementation Steps

### Step 1: Update Firebase Scripts

Modify your population scripts to use clean document IDs:

```javascript
// In populate-firebase-data.js
const { generatePrayerDocumentId, generateCategoryDocumentId } = require('./utils/documentUtils');

// For prayers
const cleanPrayerId = generatePrayerDocumentId(prayer.title, prayer.category);
await db.collection('prayers').doc(cleanPrayerId).set({
  id: cleanPrayerId, // Update the id field to match
  title: prayer.title,
  content: prayer.content,
  // ... other fields
});

// For categories
const cleanCategoryId = generateCategoryDocumentId(category.title);
await db.collection('prayerCategories').doc(cleanCategoryId).set({
  id: cleanCategoryId,
  title: category.title,
  // ... other fields
});
```

### Step 2: Migration Script for Existing Data

Create a migration script to clean existing document IDs:

```javascript
// scripts/migrate-clean-document-ids.js
const admin = require('firebase-admin');
const { generatePrayerDocumentId, generateCategoryDocumentId } = require('../utils/documentUtils');

async function migratePrayerDocuments() {
  const prayersSnapshot = await db.collection('prayers').get();
  const batch = db.batch();
  
  prayersSnapshot.forEach((doc) => {
    const data = doc.data();
    const cleanId = generatePrayerDocumentId(data.title, data.category);
    
    if (doc.id !== cleanId) {
      // Create new document with clean ID
      const newDocRef = db.collection('prayers').doc(cleanId);
      batch.set(newDocRef, { ...data, id: cleanId });
      
      // Delete old document
      batch.delete(doc.ref);
    }
  });
  
  await batch.commit();
}
```

### Step 3: Update Service Functions

Modify `firebaseService.ts` to use clean IDs for new documents:

```typescript
import { generatePrayerDocumentId, generateUserDocumentId } from '../utils/documentUtils';

// When creating new prayers
static async createPrayer(prayerData: Partial<Prayer>): Promise<string> {
  const cleanId = generatePrayerDocumentId(prayerData.title!, prayerData.category);
  
  await setDoc(doc(db, 'prayers', cleanId), {
    ...prayerData,
    id: cleanId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return cleanId;
}
```

## 🎨 CMS Management Benefits

### Before (Jumbled IDs)
```
prayers/
├── MfSZm1EWpZH2BXHaZmBP3CayoO2
├── QwE789RtY456UiO123
├── XyZ123AbC456DeF789
└── AaA111BbB222CcC333
```

### After (Clean IDs)
```
prayers/
├── traditional-our-father
├── traditional-hail-mary
├── morning-prayer-before-study
├── evening-angelus
├── student-prayer-for-wisdom
└── devotional-sacred-heart
```

## 📝 CMS Best Practices

### 1. Document ID Naming Convention
- Use lowercase letters only
- Replace spaces with hyphens (`-`)
- Remove special characters
- Keep it descriptive but concise
- Include category prefix when helpful

### 2. Examples of Good Document IDs
```
✅ Good Examples:
- traditional-our-father
- morning-prayer-before-study
- devotional-sacred-heart
- student-exam-preparation
- evening-angelus

❌ Bad Examples:
- OurFather123
- morning_prayer_before_study
- Prayer#1
- MfSZm1EWpZH2BXHaZmBP3CayoO2
```

### 3. Managing Through Firebase Console

#### Adding New Prayers:
1. Go to Firebase Console → Firestore Database
2. Navigate to `prayers` collection
3. Click "Add document"
4. **Document ID:** Use clean format (e.g., `traditional-our-father`)
5. **Fields:**
   ```
   id: "traditional-our-father"
   title: "Our Father"
   category: "traditional"
   content: "Our Father, who art in heaven..."
   ```

#### Adding New Categories:
1. Navigate to `prayerCategories` collection
2. **Document ID:** Use clean format (e.g., `traditional-prayers`)
3. **Fields:**
   ```
   id: "traditional-prayers"
   title: "Traditional Prayers"
   description: "Classic Catholic prayers"
   ```

#### Adding Suggested Prayers:
1. Navigate to `suggested_prayers` collection
2. **Document ID:** Use clean format (e.g., `morning-study-prayer`)
3. **Fields:**
   ```
   id: "morning-study-prayer"
   title: "Morning Study Prayer"
   prayerId: "traditional-our-father"
   timeContext: "morning"
   ```

## 🔧 Utility Functions Available

The app includes utility functions in `utils/documentUtils.ts`:

- `generatePrayerDocumentId(title, category)` - Creates clean prayer IDs
- `generateCategoryDocumentId(title)` - Creates clean category IDs
- `generateSuggestedPrayerDocumentId(title, timeContext)` - Creates clean suggestion IDs
- `isCleanDocumentId(id)` - Validates if an ID is clean
- `cleanExistingDocumentId(jumbledId, fallbackName)` - Cleans existing jumbled IDs

## 🚀 Implementation Checklist

- [ ] Create `utils/documentUtils.ts` with utility functions
- [ ] Update `populate-firebase-data.js` to use clean IDs
- [ ] Create migration script for existing data
- [ ] Update `firebaseService.ts` for new document creation
- [ ] Test with a few sample documents
- [ ] Run migration script on production data
- [ ] Update CMS documentation for team
- [ ] Train team on new naming conventions

## Expected Results

### CMS Management Improvements:
1. **Easy Identification:** Instantly know what each document contains
2. **Better Organization:** Documents are naturally grouped and sorted
3. **Faster Navigation:** Find specific prayers without opening each document
4. **Reduced Errors:** Less chance of editing wrong documents
5. **Better SEO:** Clean URLs if exposed to web interface

### Developer Benefits:
1. **Easier Debugging:** Logs show meaningful document IDs
2. **Better Code Readability:** References to documents are self-explanatory
3. **Simplified Testing:** Test data is easier to set up and verify
4. **Improved Maintenance:** Code is more maintainable with clear references

##  Monitoring and Validation

After implementation:
1. Check Firebase Console to ensure all new documents use clean IDs
2. Monitor application logs for any reference errors
3. Validate that all existing functionality still works
4. Update any hardcoded document ID references in the code

## Support

If you encounter issues during implementation:
1. Check the utility functions in `utils/documentUtils.ts`
2. Verify Firebase security rules allow the new document structure
3. Test with a small subset of data first
4. Keep backups of existing data before running migration scripts

This clean naming system will make your CMS management significantly easier and more intuitive!