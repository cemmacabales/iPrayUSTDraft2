# CMS Setup Guide for UST Prayer Library

This guide explains how to set up and manage the UST Prayer Library as a Content Management System (CMS), allowing you to easily manage prayers, images, and content through Firebase.

## 🎯 Overview

The UST Prayer Library is now CMS-ready, meaning:
- ✅ Prayer content is stored in Firebase Firestore
- ✅ Prayer images can be managed through the database
- ✅ Content can be updated without code changes
- ✅ Backward compatibility with existing hardcoded images
- ✅ Easy content management through Firebase Console

## 📊 Database Structure for CMS

### Prayer Documents Structure

Each prayer in the `prayers` collection now supports the following fields:

```javascript
{
  id: "prayer-id",                    // Unique identifier
  title: "Prayer Title",              // Display name
  content: "Full prayer text...",     // Prayer content
  category: "category-id",            // Reference to category
  subcategory: "subcategory",         // Optional grouping
  description: "Brief description",   // Prayer description
  tags: ["tag1", "tag2"],            // Search tags
  image: "https://example.com/image.jpg", // 🆕 CMS-managed image URL
  order: 1,                           // Display order
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Key CMS Features

1. **Image Management**: Each prayer can have a custom image URL
2. **Content Updates**: All text content can be updated through Firebase Console
3. **Category Management**: Prayers can be reorganized by changing categories
4. **Search Optimization**: Tags and descriptions improve discoverability
5. **Display Control**: Order field controls how prayers appear in lists

## 🖼️ Image Management

### Option 1: Using Firebase Storage (Recommended)

1. **Upload images to Firebase Storage**:
   ```bash
   # Navigate to Firebase Console > Storage
   # Create folder structure: /images/prayers/
   # Upload images with descriptive names
   ```

2. **Get public URLs**:
   - Right-click uploaded image → "Get download URL"
   - Copy the URL for use in prayer documents

3. **Update prayer documents**:
   ```javascript
   // In Firebase Console > Firestore
   {
     "id": "our-father",
     "title": "Our Father",
     "image": "https://firebasestorage.googleapis.com/v0/b/your-project/o/images%2Fprayers%2Four-father.jpg?alt=media&token=..."
   }
   ```

### Option 2: Using External Image URLs

You can use any publicly accessible image URL:
- Unsplash: `https://images.unsplash.com/photo-id?w=400&h=300&fit=crop`
- Your own CDN or website
- Other image hosting services

### Option 3: Migrate Existing Images

Use the provided script to migrate from hardcoded images:

```bash
# 1. Update the script with your Firebase credentials
# Edit scripts/add-prayer-images.js:
# - Add your serviceAccountKey.json path
# - Update your project ID

# 2. Install Firebase Admin SDK
npm install firebase-admin

# 3. Run the migration script
node scripts/add-prayer-images.js
```

## 📝 Content Management Workflows

### Adding New Prayers

1. **Through Firebase Console**:
   - Go to Firestore Database
   - Navigate to `prayers` collection
   - Click "Add document"
   - Fill in all required fields including `image` URL

2. **Bulk Import** (for multiple prayers):
   - Use the existing `populate-firebase-data.js` script
   - Add image URLs to the prayer data
   - Run the script to import

### Managing Suggested Prayers (🆕 New Feature)

The app now includes a separate `suggested_prayers` collection for easier CMS management:

1. **Adding Suggested Prayers**:
   ```bash
   # Use the provided script to populate initial data
   node scripts/populate-suggested-prayers.js
   ```

2. **Through Firebase Console**:
   - Go to Firestore Database
   - Navigate to `suggested_prayers` collection
   - Click "Add document"
   - Fill in the required fields:
     - `id`: Unique identifier
     - `title`: Display title for the suggestion
     - `description`: Brief description
     - `prayerId`: Reference to prayer in main collection
     - `timeContext`: morning, evening, study, exam, anytime
     - `tags`: Array of search tags
     - `image`: Custom image URL
     - `order`: Display order (lower numbers appear first)
     - `isActive`: Boolean to enable/disable

3. **Time-Based Suggestions**:
   - Set `timeContext` to control when suggestions appear:
     - `morning`: Shows during morning hours
     - `evening`: Shows during evening hours
     - `study`: Shows for study-related contexts
     - `exam`: Shows for exam periods
     - `anytime`: Always available

4. **Managing Suggestion Order**:
   - Use the `order` field to control display sequence
   - Lower numbers appear first
   - Suggestions are automatically sorted by order

5. **Custom Images for Suggestions**:
   - Each suggestion can have its own image
   - Falls back to the referenced prayer's image if not set
   - Use high-quality images (400x300 recommended)

### Updating Prayer Images

1. **Individual Updates**:
   ```javascript
   // In Firebase Console, edit prayer document
   {
     "image": "https://new-image-url.com/prayer.jpg",
     "updatedAt": "2024-01-15T10:30:00Z"
   }
   ```

2. **Batch Updates**:
   - Use Firebase Admin SDK
   - Create custom scripts for bulk operations

### Managing Categories

1. **Add New Categories**:
   ```javascript
   // In prayerCategories collection
   {
     "id": "new-category",
     "title": "New Category",
     "description": "Category description",
     "icon": "icon-name",
     "order": 5
   }
   ```

2. **Reorganize Prayers**:
   - Update the `category` field in prayer documents
   - Prayers will automatically appear in new categories

## 🔧 Technical Implementation

### How Image Loading Works

```typescript
// In app/home.tsx
const getPrayerImage = (prayer: Prayer): string => {
  // 1. First check if prayer has CMS image
  if (prayer.image) {
    return prayer.image; // Use database image
  }
  
  // 2. Fallback to hardcoded mapping
  return imageMap[prayer.id] || defaultImage;
};
```

### Benefits of This Approach

- ✅ **Backward Compatibility**: Existing prayers without images still work
- ✅ **Gradual Migration**: You can update images one by one
- ✅ **Performance**: Images load directly from URLs (cached by browsers)
- ✅ **Flexibility**: Mix of Firebase Storage, CDN, and external images

## 📱 App Behavior

### Suggested Prayers Feature

- Prayers with database images will use those images
- Prayers without database images fall back to hardcoded mappings
- New prayers automatically get images if added to database with image URLs

### Prayer Detail Views

- All prayer images are now dynamically loaded
- Images are responsive and optimized for mobile viewing
- Fallback images ensure no broken image states

## 🚀 Best Practices

### Image Guidelines

1. **Dimensions**: Use 400x300px or similar aspect ratio (4:3)
2. **Format**: JPEG for photos, PNG for graphics with transparency
3. **Size**: Keep under 200KB for fast loading
4. **Quality**: Balance between quality and file size
5. **Content**: Choose images that reflect the prayer's theme

### Content Guidelines

1. **Consistency**: Use consistent formatting for prayer content
2. **Accuracy**: Ensure all prayer texts are accurate and properly formatted
3. **Descriptions**: Write clear, helpful descriptions for each prayer
4. **Tags**: Use relevant tags for better searchability
5. **Categories**: Keep categories organized and logical

### Security Considerations

1. **Image URLs**: Ensure all image URLs are from trusted sources
2. **Content Validation**: Validate prayer content before adding to database
3. **Access Control**: Use Firebase Security Rules to control who can edit content
4. **Backup**: Regularly backup your Firestore database

## 🔄 Migration Checklist

- [ ] Update Firebase database structure with image fields
- [ ] Run image migration script for existing prayers
- [ ] Test image loading in the app
- [ ] Upload new images to Firebase Storage or CDN
- [ ] Update prayer documents with new image URLs
- [ ] Test suggested prayers feature with new images
- [ ] Verify backward compatibility with existing prayers
- [ ] Document your image management workflow

## 📞 Support

For technical issues:
1. Check Firebase Console for database connectivity
2. Verify image URLs are publicly accessible
3. Check browser network tab for failed image requests
4. Review Firebase Security Rules if images aren't loading

---

**Your UST Prayer Library is now fully CMS-ready!** 🎉

You can manage all content, images, and prayers through Firebase Console without needing to update the app code.