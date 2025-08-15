const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
// and place it in the project root or update the path below
const serviceAccount = require('../serviceAccountKey.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'iprayust' // Updated with actual project ID
});

const db = admin.firestore();

// Sample suggested prayers data
// These reference actual prayer IDs from the main prayers collection
const SUGGESTED_PRAYERS = [
  {
    id: 'morning-suggestion-1',
    title: 'Morning Prayer Starter',
    description: 'Perfect way to start your day with prayer',
    prayerId: 'before-study', // References prayer in main collection
    timeContext: 'morning',
    tags: ['morning', 'study', 'daily'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    order: 1,
    isActive: true
  },
  {
    id: 'morning-suggestion-2',
    title: 'Guardian Angel Prayer',
    description: 'Ask for protection throughout your day',
    prayerId: 'guardian-angel',
    timeContext: 'morning',
    tags: ['morning', 'protection', 'angels'],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    order: 2,
    isActive: true
  },
  {
    id: 'evening-suggestion-1',
    title: 'Evening Reflection',
    description: 'End your day with gratitude and reflection',
    prayerId: 'angelus',
    timeContext: 'evening',
    tags: ['evening', 'reflection', 'gratitude'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    order: 3,
    isActive: true
  },
  {
    id: 'study-suggestion-1',
    title: 'Before Study Prayer',
    description: 'Prepare your mind and heart for learning',
    prayerId: 'before-study',
    timeContext: 'study',
    tags: ['study', 'learning', 'wisdom'],
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    order: 4,
    isActive: true
  },
  {
    id: 'exam-suggestion-1',
    title: 'Prayer Before Exams',
    description: 'Seek guidance and calm before important tests',
    prayerId: 'before-study', // Can reference same prayer with different context
    timeContext: 'exam',
    tags: ['exam', 'stress', 'guidance'],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    order: 5,
    isActive: true
  },
  {
    id: 'special-intention-1',
    title: 'Prayer for Special Intentions',
    description: 'For your personal prayers and requests',
    prayerId: 'st-joseph',
    timeContext: 'anytime',
    tags: ['intentions', 'personal', 'requests'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    order: 6,
    isActive: true
  }
];

// Function to populate suggested prayers
async function populateSuggestedPrayers() {
  try {
    console.log('🚀 Starting to populate suggested prayers...');
    console.log('📊 Connecting to Firestore...');
    
    const batch = db.batch();
    let addedCount = 0;
    
    // Add each suggested prayer to the collection
    for (const suggestedPrayer of SUGGESTED_PRAYERS) {
      const docRef = db.collection('suggested_prayers').doc(suggestedPrayer.id);
      
      batch.set(docRef, {
        ...suggestedPrayer,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Prepared suggested prayer: ${suggestedPrayer.title}`);
      addedCount++;
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`\n🎉 Successfully added ${addedCount} suggested prayers!`);
    console.log('\n📋 Summary:');
    console.log(`   • Total suggested prayers: ${addedCount}`);
    console.log(`   • Collection: suggested_prayers`);
    console.log(`   • All prayers are active and ready for CMS management`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Go to Firebase Console > Firestore Database');
    console.log('   2. Navigate to the "suggested_prayers" collection');
    console.log('   3. You can now manage suggested prayers through the CMS');
    console.log('   4. Update prayer references, images, and order as needed');
    
  } catch (error) {
    console.error('❌ Error populating suggested prayers:', error);
    process.exit(1);
  }
}

// Function to verify prayer references exist
async function verifyPrayerReferences() {
  console.log('\n🔍 Verifying prayer references...');
  
  const uniquePrayerIds = [...new Set(SUGGESTED_PRAYERS.map(sp => sp.prayerId))];
  
  for (const prayerId of uniquePrayerIds) {
    try {
      const prayerDoc = await db.collection('prayers').doc(prayerId).get();
      if (prayerDoc.exists) {
        console.log(`  ✅ Prayer reference verified: ${prayerId}`);
      } else {
        console.log(`  ⚠️  Prayer reference not found: ${prayerId}`);
      }
    } catch (error) {
      console.log(`  ❌ Error checking prayer: ${prayerId}`);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🙏 UST Prayer Library - Suggested Prayers Setup');
    console.log('=' .repeat(50));
    
    // Verify prayer references first
    await verifyPrayerReferences();
    
    // Populate suggested prayers
    await populateSuggestedPrayers();
    
    console.log('\n✨ Setup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  populateSuggestedPrayers,
  SUGGESTED_PRAYERS
};