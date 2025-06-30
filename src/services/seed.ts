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
        // Initialize Firebase Admin SDK
        // GOOGLE_APPLICATION_CREDENTIALS should be set in your .env file
        // pointing to your serviceAccountKey.json
        const app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        return app;
    } catch (error: any) {
        if (error.code === 'app/duplicate-app') {
            return admin.app();
        }
        console.error('Firebase Admin initialization error:', error);
        // We throw here because seeding cannot proceed without the admin app.
        // The page will catch this and display a generic error.
        throw new Error("Firebase Admin SDK could not be initialized. Please check your service account credentials.");
    }
}

// Sample Data, same as the original seed script
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
  { serialNumber: 'SN1001', issuedTo: 'Employee One', status: 'storage', location: { mainBox: 1, subBox: 'a' } },
  { serialNumber: 'SN1002', issuedTo: 'Employee Three', status: 'storage', location: { mainBox: 1, subBox: 'b' } },
  { serialNumber: 'SN1003', issuedTo: 'Employee Four', status: 'storage', location: { mainBox: 2, subBox: 'c' } },
  { serialNumber: 'SN1004', issuedTo: 'Employee Five', status: 'storage', location: { mainBox: 3, subBox: 'd' } },
  { serialNumber: 'SN1005', issuedTo: 'Leader Two', status: 'with-employee', location: { mainBox: 4, subBox: 'e' } },
  { serialNumber: 'SN1006', issuedTo: 'Employee Two', status: 'with-employee', location: { mainBox: 5, subBox: 'f' } },
  { serialNumber: 'SN1007', issuedTo: 'Employee Six', status: 'storage', location: { mainBox: 6, subBox: 'g' } },
  { serialNumber: 'SN1008', issuedTo: 'Employee Seven', status: 'storage', location: { mainBox: 8, subBox: 'a' } },
  { serialNumber: 'SN1009', issuedTo: 'Employee Eight', status: 'storage', location: { mainBox: 8, subBox: 'c' } },
];


export async function ensureDatabaseSeeded() {
    const adminApp = initializeAdminApp();
    if (!adminApp) {
        console.log("Admin app not initialized, skipping seed check.");
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
            const allUsers = await usersCollection.get(); // Re-fetch users to get IDs
            const userMap = new Map(allUsers.docs.map(doc => [doc.data().name, doc.id]));

            for (const dscData of dscs) {
                const docRef = dscsCollection.doc();
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + Math.ceil(Math.random() * 2));
                
                const completeDscData: any = {
                    ...dscData,
                    expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
                    currentHolderId: dscData.status === 'with-employee' ? userMap.get(dscData.issuedTo) || null : null,
                };

                dscsBatch.set(docRef, completeDscData);
            }
            await dscsBatch.commit();
            console.log(`Successfully seeded ${dscs.length} DSCs.`);
        }
    } catch (error) {
        console.error('Error during automatic database seeding:', error);
        // Don't re-throw the error, as the page will catch its own fetch errors.
        // This function is best-effort.
    }
}
    