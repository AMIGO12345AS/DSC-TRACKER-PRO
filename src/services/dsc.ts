'use server';
import { db } from '@/lib/firebase';
import type { DSC } from '@/types';
import { collection, getDocs, addDoc, doc, updateDoc, Timestamp, query, where, runTransaction, orderBy } from 'firebase/firestore';

export async function getDscs(options: { sortByExpiry?: boolean } = {}): Promise<DSC[]> {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error("Firebase project ID is not configured. Please check your .env file.");
    }
    const dscsCol = collection(db, 'dscs');
    let q = query(dscsCol);

    if (options.sortByExpiry) {
        q = query(q, orderBy('expiryDate', 'asc'));
    }

    const dscSnapshot = await getDocs(q);
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
        description: data.description || 'N/A'
      } as DSC;
    });
    return dscList;
  } catch (error) {
    console.error("Error fetching DSCs:", error);
    throw error;
  }
}

// Omit DSC fields that are auto-generated or have defaults
type AddDscData = Pick<DSC, 'serialNumber' | 'description'> & {
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
        clientName: null,
        clientDetails: null,
    };

    const docRef = await addDoc(dscsCol, newDsc);
    return docRef.id;
}

type UpdateDscData = Pick<DSC, 'serialNumber' | 'description'> & {
  expiryDate: string;
  location: { mainBox: number, subBox: string };
};

export async function updateDsc(dscId: string, dscData: UpdateDscData) {
  const dscRef = doc(db, 'dscs', dscId);

  // Check if another DSC with the new serial number already exists (and it's not the current one)
  if (dscData.serialNumber) {
      const q = query(collection(db, 'dscs'), where("serialNumber", "==", dscData.serialNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs.some(d => d.id !== dscId)) {
        throw new Error(`Another DSC with serial number ${dscData.serialNumber} already exists.`);
      }
  }

  const updatedDsc = {
    ...dscData,
    expiryDate: Timestamp.fromDate(new Date(dscData.expiryDate)),
  };

  await updateDoc(dscRef, updatedDsc);
}

export async function deleteDsc(dscId: string) {
    const dscRef = doc(db, 'dscs', dscId);
    
    await runTransaction(db, async (transaction) => {
        const dscDoc = await transaction.get(dscRef);
        if (!dscDoc.exists()) {
            throw new Error("DSC not found.");
        }
        const dscData = dscDoc.data();

        if (dscData.status !== 'storage') {
            throw new Error("Cannot delete a DSC that is currently held by an employee or client.");
        }
        
        transaction.delete(dscRef);
    });
}


export async function takeDsc(dscId: string, userId: string) {
    const dscRef = doc(db, 'dscs', dscId);
    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw new Error("User does not exist!");
        }
        if (userDoc.data().hasDsc) {
            throw new Error("User already holds a DSC.");
        }

        const dscDoc = await transaction.get(dscRef);
        if (!dscDoc.exists()) {
            throw new Error("DSC does not exist!");
        }
        if (dscDoc.data().status !== 'storage') {
            throw new Error("DSC is not in storage.");
        }

        transaction.update(dscRef, {
            status: 'with-employee',
            currentHolderId: userId
        });
        transaction.update(userRef, { hasDsc: true });
    });
}

export async function returnDsc(dscId: string, userId: string) {
    const dscRef = doc(db, 'dscs', dscId);
    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (transaction) => {
        const dscDoc = await transaction.get(dscRef);
        if (!dscDoc.exists()) {
            throw new Error("DSC does not exist!");
        }

        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw new Error("User does not exist!");
        }

        if (dscDoc.data().currentHolderId !== userId) {
            throw new Error("User does not hold this DSC.");
        }

        transaction.update(dscRef, {
            status: 'storage',
            currentHolderId: null
        });
        transaction.update(userRef, { hasDsc: false });
    });
}

export async function takeDscByClient(dscId: string, clientName: string, clientDetails: string) {
    const dscRef = doc(db, 'dscs', dscId);
    
    await runTransaction(db, async (transaction) => {
        const dscDoc = await transaction.get(dscRef);
        if (!dscDoc.exists()) throw new Error("DSC does not exist!");
        if (dscDoc.data().status !== 'storage') throw new Error("DSC is not available in storage.");

        transaction.update(dscRef, {
            status: 'with-client',
            currentHolderId: null,
            clientName: clientName,
            clientDetails: clientDetails
        });
    });
}

export async function returnDscFromClient(dscId: string) {
    const dscRef = doc(db, 'dscs', dscId);

    await runTransaction(db, async (transaction) => {
        const dscDoc = await transaction.get(dscRef);
        if (!dscDoc.exists()) throw new Error("DSC does not exist!");
        if (dscDoc.data().status !== 'with-client') throw new Error("DSC is not currently with a client.");

        transaction.update(dscRef, {
            status: 'storage',
            clientName: null,
            clientDetails: null
        });
    });
}
