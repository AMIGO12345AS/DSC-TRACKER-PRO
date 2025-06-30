'use server';
import { db } from '@/lib/firebase';
import type { DSC } from '@/types';
import { collection, getDocs, addDoc, Timestamp, query, where } from 'firebase/firestore';

export async function getDscs(): Promise<DSC[]> {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error("Firebase project ID is not configured. Please check your .env file.");
    }
    const dscsCol = collection(db, 'dscs');
    const dscSnapshot = await getDocs(dscsCol);
    const dscList = dscSnapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore timestamp needs to be converted to ISO string for client-side date formatting
      const expiryDate = data.expiryDate instanceof Timestamp 
        ? data.expiryDate.toDate().toISOString() 
        : new Date().toISOString(); // Fallback
      return {
        id: doc.id,
        ...data,
        expiryDate,
      } as DSC;
    });
    return dscList;
  } catch (error) {
    console.error("Error fetching DSCs:", error);
    throw error;
  }
}

// Omit DSC fields that are auto-generated or have defaults
type AddDscData = Pick<DSC, 'serialNumber' | 'issuedTo'> & {
  expiryDate: string; // The form will provide a string
  location: { mainBox: number, subBox: string };
};

export async function addDsc(dscData: AddDscData) {
    const dscsCol = collection(db, 'dscs');
    
    // Check for existing serial number before adding
    const q = query(dscsCol, where("serialNumber", "==", dscData.serialNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error(`A DSC with serial number ${dscData.serialNumber} already exists.`);
    }

    const newDsc = {
        ...dscData,
        expiryDate: Timestamp.fromDate(new Date(dscData.expiryDate)),
        status: 'storage' as const,
        currentHolderId: null,
    };

    const docRef = await addDoc(dscsCol, newDsc);
    return docRef.id;
}
