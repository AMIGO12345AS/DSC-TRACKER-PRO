'use server';

import { adminApp, adminAuth, adminDb } from '@/lib/firebaseAdmin';

// Sample Data for automatic seeding
const seedUsers = [
  { email: 'leader@certitrack.app', password: 'password123', name: 'Current Leader', role: 'leader' as const, hasDsc: false },
  { email: 'employee@certitrack.app', password: 'password123', name: 'Employee One', role: 'employee' as const, hasDsc: false },
  { email: 'leader.two@certitrack.app', password: 'password123', name: 'Leader Two', role: 'leader' as const, hasDsc: true },
  { email: 'employee.two@certitrack.app', password: 'password123', name: 'Employee Two', role: 'employee' as const, hasDsc: true },
];

const dscsData = [
  { serialNumber: 'SN1001', description: 'Finance Department DSC', status: 'storage' as const, location: { mainBox: 1, subBox: 'a' } },
  { serialNumber: 'SN1002', description: 'HR Department DSC', status: 'storage' as const, location: { mainBox: 1, subBox: 'b' } },
  { serialNumber: 'SN1003', description: 'Old IT DSC', status: 'storage' as const, location: { mainBox: 2, subBox: 'c' } },
  { serialNumber: 'SN1004', description: 'Marketing Team DSC', status: 'storage' as const, location: { mainBox: 3, subBox: 'd' } },
  { serialNumber: 'SN1005', description: 'DSC for Leader Two', status: 'with-employee' as const, location: { mainBox: 4, subBox: 'e' }, holderName: 'Leader Two' },
  { serialNumber: 'SN1006', description: 'DSC for Employee Two', status: 'with-employee' as const, location: { mainBox: 5, subBox: 'f' }, holderName: 'Employee Two' },
];

async function seedAuthUsers() {
    const createdUsers = [];
    for (const userData of seedUsers) {
        try {
            const userRecord = await adminAuth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.name,
                emailVerified: true,
            });
            console.log('Successfully created new user in Auth:', userRecord.uid);
            createdUsers.push({ ...userData, uid: userRecord.uid });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                console.log(`User with email ${userData.email} already exists. Fetching...`);
                const userRecord = await adminAuth.getUserByEmail(userData.email);
                createdUsers.push({ ...userData, uid: userRecord.uid });
            } else {
                console.error('Error creating user:', error);
            }
        }
    }
    return createdUsers;
}

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
            const createdUsers = await seedAuthUsers();
            
            const usersBatch = adminDb.batch();
            createdUsers.forEach(user => {
                const { uid, name, role, hasDsc } = user;
                const userDocRef = usersCollection.doc(uid); // Use UID as document ID
                usersBatch.set(userDocRef, { uid, name, role, hasDsc });
            });
            await usersBatch.commit();
            console.log(`Successfully seeded ${createdUsers.length} users in Firestore.`);
            
            // Now seed DSCs since we have users
            await seedDscs(createdUsers);
        }

    } catch (error) {
        console.error('Error during automatic database seeding:', error);
    }
}


async function seedDscs(users: { uid: string, name: string }[]) {
    const dscsCollection = adminDb.collection('dscs');
    const dscDocs = await dscsCollection.limit(1).get();

    if (!dscDocs.empty) {
        console.log('DSCs collection is not empty. Skipping DSC seeding.');
        return;
    }
    
    console.log('DSCs collection is empty. Seeding DSCs...');
    const dscsBatch = adminDb.batch();
    const userNameToIdMap = new Map(users.map(u => [u.name, u.uid]));

    for (const dscData of dscsData) {
        const docRef = dscsCollection.doc();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + Math.ceil(Math.random() * 2));
        
        let holderId = null;
        if (dscData.status === 'with-employee' && dscData.holderName) {
            holderId = userNameToIdMap.get(dscData.holderName) || null;
        }

        const { holderName, ...restOfDscData } = dscData;

        const completeDscData = {
            ...restOfDscData,
            expiryDate,
            currentHolderId: holderId,
        };

        dscsBatch.set(docRef, completeDscData);
    }
    await dscsBatch.commit();
    console.log(`Successfully seeded ${dscsData.length} DSCs.`);
}
