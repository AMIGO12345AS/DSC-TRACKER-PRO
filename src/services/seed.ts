'use server';
import * as admin from 'firebase-admin';
import type { User, DSC } from '@/types';

// This function should only be called once per server instance.
function initializeAdminApp() {
    // Prevent re-initializing the app
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
        if (!serviceAccountJson) {
            console.warn('FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set. Automatic seeding will be skipped.');
            return null;
        }
        const serviceAccount = JSON.parse(serviceAccountJson);

        // Initialize Firebase Admin SDK
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        return app;
    } catch (error: any) {
        // If the service account key is missing or invalid, initialization will fail.
        // We catch this error and return null so the app doesn't crash.
        // Seeding will be skipped, and the user will see the setup guide instead.
        console.warn('Firebase Admin initialization failed. Automatic seeding will be skipped. This is expected if the service account key is invalid or not provided correctly. Error:', error.message);
        return null;
    }
}

// Sample Data for automatic seeding
const users: Omit<User, 'id'>[] = [
  { name: 'Current Leader', role: 'leader', hasDsc: false },
  { name: 'Leader Two', role: 'leader', hasDsc: true },
  { name: 'Employee One', role: 'employee', hasDsc: false },
  { name: 'Employee Two', role: 'employee', hasDsc: true },
  { name: 'Employee Three', role: 'employee', hasDsc: false },
  { name: 'Employee Four', role: 'employee', hasDsc: false },
  { name: 'Employee Five', role: 'employee', hasDsc: false },
  { name: 'Employee Six', role: 'employee', hasDsc: false },
  { name: 'Employee Seven', role: 'employee', hasDsc: false },
  { name: 'Employee Eight', role: 'employee', hasDsc: false },
];

const dscs: Omit<DSC, 'id' | 'expiryDate' | 'currentHolderId'>[] = [
  { serialNumber: 'SN1001', description: 'DSC for Employee One', status: 'storage', location: { mainBox: 1, subBox: 'a' } },
  { serialNumber: 'SN1002', description: 'DSC for Employee Three', status: 'storage', location: { mainBox: 1, subBox: 'b' } },
  { serialNumber: 'SN1003', description: 'DSC for Employee Four', status: 'storage', location: { mainBox: 2, subBox: 'c' } },
  { serialNumber: 'SN1004', description: 'DSC for Employee Five', status: 'storage', location: { mainBox: 3, subBox: 'd' } },
  { serialNumber: 'SN1005', description: 'DSC for Leader Two', status: 'with-employee', location: { mainBox: 4, subBox: 'e' } },
  { serialNumber: 'SN1006', description: 'DSC for Employee Two', status: 'with-employee', location: { mainBox: 5, subBox: 'f' } },
  { serialNumber: 'SN1007', description: 'DSC for Employee Six', status: 'storage', location: { mainBox: 6, subBox: 'g' } },
  { serialNumber: 'SN1008', description: 'DSC for Employee Seven', status: 'storage', location: { mainBox: 8, subBox: 'a' } },
  { serialNumber: 'SN1009', description: 'DSC for Employee Eight', status: 'storage', location: { mainBox: 8, subBox: 'c' } },
];


export async function ensureDatabaseSeeded() {
    const adminApp = initializeAdminApp();
    if (!adminApp) {
        console.log("Admin app not initialized, skipping automatic seeding.");
        return;
    }

    const db = admin.firestore();

    try {
        const usersCollection = db.collection('users');
        const userDocs = await usersCollection.limit(1).get();
        if (userDocs.empty) {
            console.log('Users collection is empty. Seeding users...');
            const usersBatch = db.batch();
            for (const userData of users) {
                const docRef = usersCollection.doc();
                usersBatch.set(docRef, userData);
            }
            await usersBatch.commit();
            console.log(`Successfully seeded ${users.length} users.`);
        }

        const dscsCollection = db.collection('dscs');
        const dscDocs = await dscsCollection.limit(1).get();
        if (dscDocs.empty) {
            console.log('DSCs collection is empty. Seeding DSCs...');
            const dscsBatch = db.batch();
            const allUsers = await usersCollection.get();
            const userMap = new Map(allUsers.docs.map(doc => [doc.data().name, doc.id]));

            for (const dscData of dscs) {
                const docRef = dscsCollection.doc();
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + Math.ceil(Math.random() * 2));
                
                // A bit of a hack for seed data to match a user for DSCs that are 'with-employee'
                const holderName = dscData.description.replace('DSC for ', '');

                const completeDscData: any = {
                    ...dscData,
                    expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
                    currentHolderId: dscData.status === 'with-employee' ? userMap.get(holderName) || null : null,
                };

                dscsBatch.set(docRef, completeDscData);
            }
            await dscsBatch.commit();
            console.log(`Successfully seeded ${dscs.length} DSCs.`);
        }
    } catch (error) {
        console.error('Error during automatic database seeding:', error);
        // We do not re-throw the error, to prevent crashing the page.
        // The page will handle displaying a setup guide or other errors.
    }
}
