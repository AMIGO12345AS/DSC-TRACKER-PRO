'use server';

import { db } from '@/lib/firebase';
import type { User } from '@/types';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, runTransaction, getDoc, addDoc } from 'firebase/firestore';

export async function getUsers(role?: 'leader' | 'employee'): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    let q = query(usersCol);
    if (role) {
      q = query(usersCol, where('role', '==', role));
    }
    const userSnapshot = await getDocs(q);
    const userList = userSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, uid: doc.id } as User));
    return userList;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<User | null> {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return { id: userDoc.id, uid, ...userDoc.data() } as User;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}


type AddUserData = Omit<User, 'id' | 'uid' | 'hasDsc'>;

export async function addUser(userData: AddUserData) {
    const { name } = userData;

    // Check if a user with the same name already exists in Firestore
    const usersColRef = collection(db, 'users');
    const nameQuery = query(usersColRef, where("name", "==", name));
    const nameQuerySnapshot = await getDocs(nameQuery);
    if (!nameQuerySnapshot.empty) {
        throw new Error(`A user with the name "${name}" already exists.`);
    }

    // Create user profile in Firestore
    const newUserRef = await addDoc(usersColRef, {
        ...userData,
        hasDsc: false,
    });
    
    // Set the UID to be the same as the document ID
    await updateDoc(newUserRef, { uid: newUserRef.id });

    return newUserRef.id;
}


export async function updateUser(userId: string, userData: Partial<Pick<User, 'name' | 'role'>>) {
  const userDocRef = doc(db, 'users', userId);

  if (userData.name) {
    const q = query(collection(db, 'users'), where("name", "==", userData.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty && querySnapshot.docs.some(d => d.id !== userId)) {
      throw new Error(`Another user with the name "${userData.name}" already exists.`);
    }
  }

  await updateDoc(userDocRef, userData);
}

export async function deleteUser(userId: string) {
  const userRef = doc(db, 'users', userId);
  
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error("User not found.");
    if (userDoc.data().hasDsc) throw new Error("Cannot delete a user who is currently holding a DSC.");
    
    // Delete from Firestore
    transaction.delete(userRef);
  });
}
