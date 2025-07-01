'use server';

import * as admin from 'firebase-admin';

function getServiceAccount() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  
  if (!serviceAccountJson) {
      throw new Error(
        'The FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set. Please check your .env file.'
      );
  }

  try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      return serviceAccount;
  } catch (error) {
      console.error("Failed to parse service account JSON:", error);
      throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not valid JSON.');
  }
}


function initializeAdminApp() {
  // Prevent re-initialization
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const serviceAccount = getServiceAccount();

    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Parsed service account is missing required fields (project_id, private_key, client_email).');
    }

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