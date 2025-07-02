'use server';

import { getAdminDb } from '@/lib/firebaseAdmin';

// Sample Data for automatic seeding
const usersData = [
    {
        uid: 'leader01',
        name: 'Leader Admin',
        role: 'leader' as const,
    },
    {
        uid: 'employee01',
        name: 'Aseem',
        role: 'employee' as const,
    },
    {
        uid: 'employee02',
        name: 'Ben',
        role: 'employee' as const,
    },
    {
        uid: 'employee03',
        name: 'Catherine',
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
    try {
        const adminDb = await getAdminDb();
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
        // We re-throw the error here to make it visible on the frontend during development.
        // In a production environment, you might want to handle this differently.
        throw error;
    }
}

async function seedUsers() {
    const adminDb = await getAdminDb();
    const usersCollection = adminDb.collection('users');
    const userBatch = adminDb.batch();

    for (const userData of usersData) {
        const userDocRef = usersCollection.doc(userData.uid);
        userBatch.set(userDocRef, {
            ...userData,
            hasDsc: false,
        });
    }
    await userBatch.commit();
    console.log(`Successfully seeded ${usersData.length} users.`);
}


async function seedDscs() {
    const adminDb = await getAdminDb();
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
