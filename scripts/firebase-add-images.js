/**
 * Firebase Admin SDK Script to add image URLs to existing prayers
 * This uses Admin SDK to bypass Firestore security rules
 * 
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Get service account key from Firebase Console
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 4. Run: node scripts/firebase-add-images.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download the service account key from Firebase Console
let serviceAccount;
try {
  // Try to load the service account key
  serviceAccount = require('../serviceAccountKey.json');
  console.log('✅ Service account key loaded successfully');
} catch (error) {
  console.error('❌ Service account key not found!');
  console.log('\n🔧 Setup Instructions:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your "iprayust" project');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Download the JSON file');
  console.log('6. Save it as "serviceAccountKey.json" in your project root directory');
  console.log('7. Run this script again: node scripts/firebase-add-images.js');
  console.log('\n📁 The file should be saved as:');
  console.log('   /Users/carlmacabales/iPrayUSTDraft2__BACKEND/iPrayUSTDraft2/serviceAccountKey.json');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'iprayust'
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  console.log('\n🔧 Make sure your service account key is valid and has Firestore permissions');
  process.exit(1);
}

const db = admin.firestore();

// Image mapping from the current hardcoded implementation
const imageMap = {
  // Traditional Prayers
  'our-father': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'hail-mary': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'glory-be': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  'apostles-creed': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'nicene-creed': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'act-of-contrition': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  'guardian-angel': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  
  // Devotional Prayers
  'angelus': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'regina-coeli': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=300&fit=crop',
  'before-mass': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'after-mass': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'before-study': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'before-exams': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  
  // Protection Prayers
  'st-michael': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'st-joseph': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=300&fit=crop',
  'st-dominic': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'deliverance': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  
  // Marian Prayers
  'sacred-heart': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'immaculate-heart': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=300&fit=crop',
  'rosary': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'memorare': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=300&fit=crop',
  
  // Special Intentions
  'for-peace': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'for-healing': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  'for-guidance': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'for-family': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=300&fit=crop',
  
  // UST Specific
  'ust-hymn': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'thomasian-prayer': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'st-thomas-aquinas': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  
  // Additional mappings for common prayer IDs
  'act-contrition': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  
  // Missing prayers from database
  'dominican-blessing': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'intro-1': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'intro-2': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'rosary-intro': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
};

async function addImagesToPrayers() {
  try {
    console.log('🚀 Starting to add images to prayers...');
    console.log('📊 Connecting to Firestore...');
    
    // Get all prayers from the database
    const prayersSnapshot = await db.collection('prayers').get();
    
    if (prayersSnapshot.empty) {
      console.log('❌ No prayers found in the database.');
      console.log('💡 Make sure you have run the populate-firebase-data.js script first.');
      return;
    }
    
    console.log(`📚 Found ${prayersSnapshot.size} prayers in database`);
    
    const batch = db.batch();
    let updateCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    
    // Process each prayer
    prayersSnapshot.forEach((prayerDoc) => {
      const prayerData = prayerDoc.data();
      const prayerId = prayerData.id || prayerDoc.id;
      
      // Check if prayer already has an image
      if (prayerData.image) {
        console.log(`⏭️  Prayer '${prayerId}' already has an image`);
        skippedCount++;
        return;
      }
      
      // Check if we have an image mapping for this prayer
      if (imageMap[prayerId]) {
        console.log(`✅ Adding image to prayer: ${prayerId}`);
        
        // Add to batch update
        batch.update(prayerDoc.ref, {
          image: imageMap[prayerId],
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updateCount++;
      } else {
        console.log(`⚠️  No image mapping found for prayer: ${prayerId}`);
        notFoundCount++;
      }
    });
    
    // Execute batch update
    if (updateCount > 0) {
      console.log(`\n🔄 Updating ${updateCount} prayers...`);
      await batch.commit();
      console.log('✅ Batch update completed!');
    }
    
    // Summary
    console.log('\n🎉 Image update completed!');
    console.log(`✅ Updated: ${updateCount} prayers`);
    console.log(`⏭️  Skipped (already had images): ${skippedCount} prayers`);
    console.log(`⚠️  No mapping found: ${notFoundCount} prayers`);
    console.log(`📊 Total processed: ${prayersSnapshot.size} prayers`);
    
    if (updateCount > 0) {
      console.log('\n🚀 Your app is now CMS-ready with images!');
      console.log('📱 Images will appear immediately in your mobile app.');
      console.log('🎯 You can now manage images through Firebase Console.');
    }
    
  } catch (error) {
    console.error('❌ Error adding images to prayers:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Firebase Admin SDK is properly initialized');
    console.log('2. Check your service account key permissions');
    console.log('3. Ensure the prayers collection exists');
    console.log('4. Verify your internet connection');
  }
}

// Run the script
console.log('🔥 Firebase Admin Image Updater for UST Prayer Library');
console.log('====================================================');

addImagesToPrayers()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });