/**
 * Script to add image URLs to existing prayers in Firebase
 * This makes the app CMS-ready by moving images from hardcoded maps to the database
 * 
 * Usage: node scripts/add-prayer-images.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Make sure to set up your service account key
const serviceAccount = require('../path/to/your/serviceAccountKey.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'your-project-id' // Update this
});

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
  'angelus': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'memorare': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'regina-coeli': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'te-deum': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'magnificat': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  
  // Student Life Prayers
  'before-study': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  'after-study': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  'before-exams': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'after-exams': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'for-guidance': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'for-wisdom': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'for-understanding': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'for-concentration': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  'for-memory': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  'for-success': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  
  // Rosary Prayers
  'joyful-mysteries': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'sorrowful-mysteries': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  'glorious-mysteries': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'luminous-mysteries': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'how-to-pray-rosary': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  
  // Dominican Prayers
  'prayer-of-st-dominic': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'dominican-blessing': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'prayer-for-studies': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  'prayer-for-truth': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  
  // Mass Prayers
  'before-mass': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'after-mass': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'before-communion': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'after-communion': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'spiritual-communion': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  
  // Special Intentions
  'for-family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
  'for-friends': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
  'for-teachers': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'for-classmates': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
  'for-peace': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'for-healing': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  'for-strength': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'for-forgiveness': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  'for-gratitude': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
  'for-vocations': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop',
};

async function addImagesToPrayers() {
  try {
    console.log('Starting to add images to prayers...');
    
    // Get all prayers from the database
    const prayersSnapshot = await db.collection('prayers').get();
    
    if (prayersSnapshot.empty) {
      console.log('No prayers found in the database.');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    
    prayersSnapshot.forEach((doc) => {
      const prayerData = doc.data();
      const prayerId = prayerData.id || doc.id;
      
      // Check if prayer already has an image
      if (!prayerData.image && imageMap[prayerId]) {
        console.log(`Adding image to prayer: ${prayerId}`);
        batch.update(doc.ref, {
          image: imageMap[prayerId],
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updateCount++;
      } else if (prayerData.image) {
        console.log(`Prayer ${prayerId} already has an image: ${prayerData.image}`);
      } else {
        console.log(`No image mapping found for prayer: ${prayerId}`);
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updateCount} prayers with images.`);
    } else {
      console.log('No prayers needed image updates.');
    }
    
  } catch (error) {
    console.error('Error adding images to prayers:', error);
  }
}

// Run the script
addImagesToPrayers()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });