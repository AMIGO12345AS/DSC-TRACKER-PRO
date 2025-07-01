
import * as admin from 'firebase-admin';

function getServiceAccount() {
  // The private key from an environment variable needs to have its newlines restored.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !privateKey ||
    !process.env.FIREBASE_CLIENT_EMAIL
  ) {
    throw new Error(
      'Firebase server-side credentials are not set. Please check your environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };
}

function initializeAdminApp() {
  // Prevent re-initialization
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const serviceAccount = getServiceAccount();
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization failed:', error.message);
    // Throw a more informative error.
    throw new Error(
      `Failed to initialize Firebase Admin SDK. Please check your service account configuration. Original error: ${error.message}`
    );
  }
}

export const adminApp = initializeAdminApp();
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
