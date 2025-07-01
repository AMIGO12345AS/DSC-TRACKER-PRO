
import * as admin from 'firebase-admin';
// The import `* as ...` creates a module namespace object. In many bundler
// configurations, the actual content of the JSON is on the `default` property.
import * as serviceAccountRaw from '../../serviceAccountKey.json';

// This explicitly extracts the service account object from the imported module.
// Previous attempts to create a fallback were causing the invalid credential error.
const serviceAccount = (serviceAccountRaw as any).default;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // A check to provide a clearer error if the service account is still not found.
  if (!serviceAccount) {
    throw new Error('Firebase Admin Service Account is not loaded correctly. Check the import in firebaseAdmin.ts.');
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization failed:', error.message);
    throw error;
  }
}

export const adminApp = initializeAdminApp();
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
