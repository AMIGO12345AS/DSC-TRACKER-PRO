'use server';

import { adminApp, adminDb } from '@/lib/firebaseAdmin';

// Sample Data for automatic seeding
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
