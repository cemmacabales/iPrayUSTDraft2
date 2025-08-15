const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function createAppConfig() {
  try {
    console.log('Creating app config document...');
    
    const appConfigData = {
      logo: {
        iconName: 'heart-outline',
        iconLibrary: 'ionicons',
        color: '#FF6B6B',
        size: 24
      },
      appName: 'iPrayUST',
      version: '1.0.0',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Create document with specific ID 'main'
    await db.collection('appConfig').doc('main').set(appConfigData);
    
    console.log('✅ Successfully created appConfig/main document');
    
  } catch (error) {
    console.error('❌ Error creating app config:', error);
  } finally {
    process.exit(0);
  }
}

createAppConfig();