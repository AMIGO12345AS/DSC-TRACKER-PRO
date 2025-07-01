
import * as admin from 'firebase-admin';
import * as serviceAccountRaw from '../../serviceAccountKey.json';

function getServiceAccount(): admin.ServiceAccount {
    // The imported value might be the JSON object itself, or it might be
    // nested under a `default` property due to bundler behavior.
    // This handles both cases.
    const serviceAccount = (serviceAccountRaw as any).default || serviceAccountRaw;

    // A robust check for the essential fields required by Firebase.
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.error('Invalid Service Account Structure:', JSON.stringify(serviceAccount, null, 2));
        throw new Error('The service account credentials are not structured correctly or are missing required fields (project_id, private_key, client_email).');
    }
    
    return serviceAccount as admin.ServiceAccount;
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
    throw new Error(`Failed to initialize Firebase Admin SDK. Please check your service account configuration. Original error: ${error.message}`);
  }
}

export const adminApp = initializeAdminApp();
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
