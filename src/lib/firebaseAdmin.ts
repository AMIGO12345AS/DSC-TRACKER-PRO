
import * as admin from 'firebase-admin';

function getServiceAccount(): admin.ServiceAccount {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      'The FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set. Please follow the instructions to set it up.'
    );
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // A robust check for the essential fields required by Firebase.
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('The parsed service account credentials are not structured correctly or are missing required fields (project_id, private_key, client_email).');
    }

    return serviceAccount as admin.ServiceAccount;
  } catch (error) {
    throw new Error(
      `Failed to parse the FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable. Please ensure it's a valid JSON string. Error: ${error instanceof Error ? error.message : 'Unknown'}`
    );
  }
}

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const credentials = getServiceAccount();
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization failed:', error.message);
    throw new Error(
      `Failed to initialize Firebase Admin SDK. Please check your service account configuration. Original error: ${error.message}`
    );
  }
}

export const adminApp = initializeAdminApp();
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
