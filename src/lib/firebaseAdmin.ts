
import * as admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // The service account object is imported directly from the JSON file.
    // The SDK's runtime is smart enough to handle the snake_case keys from the file.
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization failed:', error.message);
    // In a real app, you might want to handle this more gracefully
    // For this context, we'll let it throw to indicate a critical configuration error
    throw error;
  }
}

export const adminApp = initializeAdminApp();
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
