# Firebase CLI Setup for Adding Prayer Images

This guide will help you set up Firebase Admin SDK to populate prayer images in your database using the Firebase CLI.

## Prerequisites

✅ Firebase Admin SDK is already installed  
✅ Script is ready at `scripts/firebase-add-images.js`

## Step-by-Step Setup

### 1. Get Firebase Service Account Key

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `iprayust`
3. **Navigate to Project Settings**:
   - Click the gear icon ⚙️ in the left sidebar
   - Select "Project settings"
4. **Go to Service Accounts tab**:
   - Click on "Service accounts" tab
   - You should see "Firebase Admin SDK" section
5. **Generate new private key**:
   - Click "Generate new private key" button
   - A dialog will appear warning about keeping the key secure
   - Click "Generate key"
6. **Download the JSON file**:
   - The file will automatically download
   - It will have a name like `iprayust-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`

### 2. Save the Service Account Key

1. **Rename the downloaded file** to `serviceAccountKey.json`
2. **Move it to your project root directory**:
   ```
   /Users/carlmacabales/iPrayUSTDraft2__BACKEND/iPrayUSTDraft2/serviceAccountKey.json
   ```
3. **⚠️ Important**: Add this file to your `.gitignore` to keep it secure!

### 3. Run the Script

Once you have the service account key in place:

```bash
node scripts/firebase-add-images.js
```

## What the Script Does

🔍 **Scans your Firebase database** for existing prayers  
🖼️ **Adds image URLs** to prayers that don't have them  
📊 **Shows progress** and summary of updates  
⚡ **Uses batch operations** for efficiency  
🛡️ **Bypasses Firestore security rules** using Admin SDK  

## Expected Output

```
🔥 Firebase Admin Image Updater for UST Prayer Library
====================================================
✅ Service account key loaded successfully
✅ Firebase Admin SDK initialized successfully
🚀 Starting to add images to prayers...
📊 Connecting to Firestore...
📚 Found 13 prayers in database
✅ Adding image to prayer: angelus
✅ Adding image to prayer: our-father
... (more prayers)

🔄 Updating 13 prayers...
✅ Batch update completed!

🎉 Image update completed!
✅ Updated: 13 prayers
⏭️  Skipped (already had images): 0 prayers
⚠️  No mapping found: 0 prayers
📊 Total processed: 13 prayers

🚀 Your app is now CMS-ready with images!
📱 Images will appear immediately in your mobile app.
🎯 You can now manage images through Firebase Console.

✨ Script completed successfully!
```

## Troubleshooting

### "Service account key not found"
- Make sure the file is named exactly `serviceAccountKey.json`
- Ensure it's in the project root directory
- Check the file path matches the one shown in the error message

### "Permission denied" errors
- Make sure you downloaded the key from the correct Firebase project
- Verify the service account has Firestore permissions
- Try regenerating the service account key

### "No prayers found in database"
- Make sure you've run the initial data population script
- Check that your Firebase project ID is correct (`iprayust`)
- Verify your internet connection

## Security Notes

🔒 **Never commit the service account key to version control**  
🔒 **Keep the key file secure and private**  
🔒 **Only use this key for development/admin tasks**  
🔒 **Consider using environment variables in production**  

## After Running the Script

Once the script completes successfully:

✅ All prayers in your database will have image URLs  
✅ Your mobile app will immediately show images  
✅ You can manage images through Firebase Console  
✅ Your app is fully CMS-ready  

## Next Steps

- Test your mobile app to see the images
- Use Firebase Console to update images as needed
- Set up your CMS to manage prayer content and images
- Consider setting up automated image optimization