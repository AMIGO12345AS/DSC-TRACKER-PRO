'use server';

import { db } from '@/lib/firebase';
import type { User } from '@/types';
import { collection, getDocs, query, where, addDoc, doc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';

export async function getUsers(role?: 'leader' | 'employee'): Promise<User[]> {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error("Firebase project ID is not configured. Please check your .env file.");
    }
    const usersCol = collection(db, 'users');
    let q = query(usersCol);
    if (role) {
      q = query(usersCol, where('role', '==', role));
    }
    const userSnapshot = await getDocs(q);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function addUser(user: Omit<User, 'id' | 'hasDsc'>) {
  const usersCol = collection(db, 'users');
  const newUser = {
    ...user,
    hasDsc: false, // New users don't have a DSC by default
  };
  const docRef = await addDoc(usersCol, newUser);
  return docRef.id;
}

export async function updateUser(userId: string, userData: Partial<Pick<User, 'name' | 'role'>>) {
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, userData);
}

export async function deleteUser(userId: string) {
  const userRef = doc(db, 'users', userId);
  
  // Use a transaction to ensure atomicity
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
        throw new Error("User not found and cannot be deleted.");
    }

    if (userDoc.data().hasDsc) {
        throw new Error("Cannot delete a user who is currently holding a DSC.");
    }
    
    transaction.delete(userRef);
  });
}
