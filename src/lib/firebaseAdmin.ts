'use server';

import * as admin from 'firebase-admin';

// Hardcoded service account for reliability in this environment.
// In a typical production setup, this would come from a secure secret manager.
function getServiceAccount() {
  const serviceAccount = {
    "type": "service_account",
    "project_id": "dsc-tracker-app",
    "private_key_id": "fa2af9af6ded12017445520a56faf1aea1f99e9d",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDvZUwcGoEXe9qU\nNNwy97/EQtfATp4t21FCSWx1wKztuAsU6NqLpXkn2wDojK87BS5TrtJe6OFadMYt\ng7AwT3S7UUnHiO79X77GvQiwNOrM5CE/D9aSP3nCRsQN9oCjDzHl38VtPzgIUFbK\nRzpiuHe6CCUQ9gfyovbcdIc2OhYSdvGzsKoH+970gcn2c+DnlltEAzv/+e75Y/aG\nWIz6U35cVHcZq0RQlkolRp8j2orj+GXWvFjftCfg7dMaVnhPsHAb4+AJZ5TuqyP2\nx8F4z8B2UvjqZ17jQN+AKuVOm0VX9C79FkWEkhEABBAhs+G6N+BbMp/ezttiTTvx\n/60FQ7dHAgMBAAECggEAVGaIxlG72I00e1MFnTyGkgmk6iptjypHBFFBmWREM41S\n7tzHjDtbMyd9sv9CmlLRyfQVPBvrs4n/ArXubKHevFnE4sHOzGqwpn2n7gPCElmN\ntR9+3VHeuhVb8rZJFPP6+hoCD2md9iRo7Oje10ZFA8PyWX/8PlmhIgk9UGt7M6eo\nMR0WXIoKyDODJyUAVaxWQkrVGOzlVIumtMZJmmYHXYwZsiLCqA05KKvyCGazZ7JH\nbWyE90YBXQLlbEv+VhMkDyASjCxNVZu1lQ+dm2VB1Aw5aX6jmQddXVk+4E/LgW7q\nzNZQ+5hJMYOsZJ3yJTtslLXp+V7SgNZW4RnYBgQElQKBgQD3n8JSqBdaBnEQvgdm\nZnh9qAnflabbigOilSczvjPYhXJpmxT6DACAvXZnCwjkyg+NJwn82qEYW8ryJuEq\n5pjPKbbkVNxPbnnm/DdVurn4l5j5h28qoF4IZu7wlkIKrc76tFQOw58P5oSBpXne\nGYh/M0Bry+T/GGIGpQPmFQWX/QKBgQD3fkljZ9flYX1OKt26oZg6yv1Izp4D/aCs\n7cwECqmrTmvdIR1JUpuRZjSl5F76G6Q3yp1/bVE7e9lBYsU9hYdD8NbThEtCSeVt\n64Kizt3dcEujumMa0hRVg7xa5rWUawUkjctfiIBMpe2lB3At8yfIo1yqVaMfxdzU\ne3AW6aOFkwKBgBEqSu8t5ciAz8+oTJ0Fl26memC8X/+x9oSLsFb+5VsqDP9TF8Yp\nlNNXzuBfvHMXqrJPNXsIsMgefNgCZ/NwXsFlk98KHueGsf6YF0HjGscnwxvxDny2\n9y2/7OpSkCtrVwC8BWOsndcdVKwkC2mg/XxL0jhmvu4MA6eQQs/tPyEFAoGAIwmP\n3jDPUbvxf2V2KnvCD2C5ZttJZ4s6egDYRyIzTvs1LgMIIF8/guATSAECqSnMn9Fh\nZq7VNzSbVzRidAk5Uxb/csZh2SqY/my++8mJg1Xof29dpGhlVI3n1n6e6joUak5g\nok+yyicbc6eP7BFmanMmJT8mbtMWJkarYbMF4V0CgYEA6doq6lgcoBvwtDNd0KcH\nacZ/73NQAxmfwLaofrUWTOuZtm1XmbxvEDE8NcbnVmOWNifNWLAMPpjcmfRU48c8\nIrxNAWNgrg9knwWIU7/iKdqUgg2bkema2kSHpUeZ5iG2Iu4wE5BLgC4ZJwB6bpky\n2P0aX2UnJAi7AToUupClmOk=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    "client_email": "firebase-adminsdk-fbsvc@dsc-tracker-app.iam.gserviceaccount.com",
    "client_id": "102838477636422643938",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40dsc-tracker-app.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  } as admin.ServiceAccount;
  
  return serviceAccount;
}


function initializeAdminApp() {
  // Prevent re-initialization
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const serviceAccount = getServiceAccount();

    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Hardcoded service account is missing required fields (project_id, private_key, client_email).');
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
export const adminDb = admin.firestore(adminApp);
