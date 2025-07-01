
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../serviceAccountKey.json';

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // The import `* as serviceAccount` creates a module namespace object.
  // In some bundlers, this object itself contains the JSON keys.
  // This approach attempts to use the imported object directly, which is a
  // different strategy from previous attempts that looked for a '.default' property.
  
  // A check to provide a clearer error if the service account is invalid.
  if (!serviceAccount || !(serviceAccount as any).project_id) {
    throw new Error('Firebase Admin Service Account is not loaded correctly. It might be empty or missing project_id. Check the import in firebaseAdmin.ts.');
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization failed:', error.message);
    throw error;
  }
}

export const adminApp = initializeAdminApp();
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
