import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

if (process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log('✓ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('✗ Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠ Firebase credentials not configured');
}

export default admin;
