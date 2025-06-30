'use server';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import type { User, DSC } from '@/types';

// Load environment variables from .env file
config();

// Check for service account key path from .env file
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS is not set in your .env file.');
  console.log('Please download your service account key from Firebase Console > Project Settings > Service accounts, save it as `serviceAccountKey.json` in the root of your project, and ensure the .env file points to it.');
  process.exit(1);
}

try {
  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase Admin initialization error:', error);
    process.exit(1);
  }
}


const db = admin.firestore();

// Sample Data
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

async function seedDatabase() {
  console.log('Starting to seed database...');

  try {
    // Seed Users
    const usersCollection = db.collection('users');
    const userDocs = await usersCollection.limit(1).get();
    if (!userDocs.empty) {
      console.log('Users collection already has data. Skipping seeding users.');
    } else {
      console.log('Seeding users...');
      const usersBatch = db.batch();
      for (const userData of users) {
        const docRef = usersCollection.doc(); // Auto-generate ID
        usersBatch.set(docRef, userData);
      }
      await usersBatch.commit();
      console.log(`Successfully seeded ${users.length} users.`);
    }

    // Seed DSCs
    const dscsCollection = db.collection('dscs');
    const dscDocs = await dscsCollection.limit(1).get();
    if (!dscDocs.empty) {
        console.log('DSCs collection already has data. Skipping seeding DSCs.');
    } else {
      console.log('Seeding DSCs...');
      const dscsBatch = db.batch();
      const allUsers = await usersCollection.get();
      const userMap = new Map(allUsers.docs.map(doc => [doc.data().name, doc.id]));

      for (const dscData of dscs) {
        const docRef = dscsCollection.doc(); // Auto-generate ID
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + Math.ceil(Math.random() * 2)); // Expires in 1 or 2 years
        
        let completeDscData: any = {
          ...dscData,
          expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
        };

        if (dscData.status === 'with-employee') {
            completeDscData.currentHolderId = userMap.get(dscData.issuedTo) || null;
        }

        dscsBatch.set(docRef, completeDscData);
      }
      await dscsBatch.commit();
      console.log(`Successfully seeded ${dscs.length} DSCs.`);
    }

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
