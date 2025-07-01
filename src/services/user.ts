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

  // Check if a user with the same name already exists
  const q = query(usersCol, where("name", "==", user.name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error(`A user with the name "${user.name}" already exists.`);
  }

  const newUser = {
    ...user,
    hasDsc: false, // New users don't have a DSC by default
  };
  const docRef = await addDoc(usersCol, newUser);
  return docRef.id;
}

export async function updateUser(userId: string, userData: Partial<Pick<User, 'name' | 'role'>>) {
  const userDocRef = doc(db, 'users', userId);

  // If name is being changed, check if the new name is already taken by another user
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
