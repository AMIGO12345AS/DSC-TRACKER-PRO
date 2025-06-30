'use server';
import { db } from '@/lib/firebase';
import type { DSC } from '@/types';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

export async function getDscs(): Promise<DSC[]> {
  try {
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
    return [];
  }
}

// Omit DSC fields that are auto-generated or have defaults
type AddDscData = Pick<DSC, 'serialNumber' | 'issuedTo'> & {
  expiryDate: string; // The form will provide a string
  location: { mainBox: number, subBox: string };
};

export async function addDsc(dscData: AddDscData) {
    const dscsCol = collection(db, 'dscs');
    
    const newDsc = {
        ...dscData,
        expiryDate: Timestamp.fromDate(new Date(dscData.expiryDate)),
        status: 'storage',
        currentHolderId: undefined,
    };

    const docRef = await addDoc(dscsCol, newDsc);
    return docRef.id;
}
