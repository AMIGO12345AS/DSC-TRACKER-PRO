
import * as admin from 'firebase-admin';
import serviceAccountKey from '../../serviceAccountKey.json';

// Define the expected structure of the service account for type safety
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

function getServiceAccount(): admin.ServiceAccount {
  // The imported JSON might be nested under a 'default' property depending on the module system.
  // This handles both cases.
  const credentials = (serviceAccountKey as any).default || serviceAccountKey;

  // A robust check for the essential fields required by Firebase.
  if (
    !credentials.project_id ||
    !credentials.private_key ||
    !credentials.client_email
  ) {
    throw new Error(
      'The serviceAccountKey.json file is not structured correctly or is missing required fields (project_id, private_key, client_email). Please ensure the file is a valid Firebase service account key.'
    );
  }

  return credentials as admin.ServiceAccount;
}

function initializeAdminApp() {
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
    throw new Error(
      `Failed to initialize Firebase Admin SDK. Please check your service account configuration. Original error: ${error.message}`
    );
  }
}

export const adminApp = initializeAdminApp();
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
