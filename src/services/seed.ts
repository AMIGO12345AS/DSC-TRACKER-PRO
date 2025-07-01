'use server';

import { adminApp, adminDb, adminAuth } from '@/lib/firebaseAdmin';

// Sample Data for automatic seeding
const usersData = [
    {
        uid: 'eEgjnwHQrrUPKjLhgYCHwZTuWI33',
        email: 'leader@certitrack.app',
        password: 'password123',
        name: 'Leader Admin',
        role: 'leader' as const,
    },
    {
        uid: 'rl4icoGtSmMwXqCcxlWoiHqlBiO2',
        email: 'aseem@certitrack.app',
        password: 'password123',
        name: 'Aseem',
        role: 'employee' as const,
    },
];

const dscsData = [
  { serialNumber: 'SN1001', description: 'Finance Department DSC', status: 'storage' as const, location: { mainBox: 1, subBox: 'a' } },
  { serialNumber: 'SN1002', description: 'HR Department DSC', status: 'storage' as const, location: { mainBox: 1, subBox: 'b' } },
  { serialNumber: 'SN1003', description: 'Old IT DSC', status: 'storage' as const, location: { mainBox: 2, subBox: 'c' } },
  { serialNumber: 'SN1004', description: 'Marketing Team DSC', status: 'storage' as const, location: { mainBox: 3, subBox: 'd' } },
  { serialNumber: 'SN1005', description: 'Legal Team DSC', status: 'storage' as const, location: { mainBox: 4, subBox: 'e' } },
  { serialNumber: 'SN1006', description: 'Operations DSC', status: 'storage' as const, location: { mainBox: 5, subBox: 'f' } },
];


export async function ensureDatabaseSeeded() {
    if (!adminApp) {
        console.log("Admin app not initialized, skipping automatic seeding.");
        return;
    }

    try {
        const usersCollection = adminDb.collection('users');
        const userDocs = await usersCollection.limit(1).get();
        if (userDocs.empty) {
            console.log('Users collection is empty. Seeding users...');
            await seedUsers();
        }

        const dscsCollection = adminDb.collection('dscs');
        const dscDocs = await dscsCollection.limit(1).get();
        if (dscDocs.empty) {
            console.log('DSCs collection is empty. Seeding DSCs...');
            await seedDscs();
        }

    } catch (error) {
        console.error('Error during automatic database seeding:', error);
    }
}

async function seedUsers() {
    const usersCollection = adminDb.collection('users');
    
    for (const userData of usersData) {
        try {
            await adminAuth.createUser({
                uid: userData.uid,
                email: userData.email,
                password: userData.password,
                displayName: userData.name,
            });
            console.log(`Created Auth user: ${userData.email}`);
        } catch (error: any) {
            if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
                console.log(`Auth user ${userData.email} already exists. Skipping creation, but ensuring Firestore profile exists.`);
            } else {
                throw error; // Re-throw other errors
            }
        }

        // Set user profile in Firestore, using the specified UID as the document ID
        const userDocRef = usersCollection.doc(userData.uid);
        await userDocRef.set({
            uid: userData.uid,
            name: userData.name,
            role: userData.role,
            hasDsc: false,
        });
    }
    console.log(`Successfully seeded ${usersData.length} users in Firestore.`);
}


async function seedDscs() {
    const dscsCollection = adminDb.collection('dscs');
    const dscsBatch = adminDb.batch();

    for (const dscData of dscsData) {
        const docRef = dscsCollection.doc();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + Math.ceil(Math.random() * 2));
        
        const completeDscData = {
            ...dscData,
            expiryDate,
            currentHolderId: null,
        };

        dscsBatch.set(docRef, completeDscData);
    }
    await dscsBatch.commit();
    console.log(`Successfully seeded ${dscsData.length} DSCs.`);
}
