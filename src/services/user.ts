'use server';

import { db } from '@/lib/firebase';
import type { User } from '@/types';
import { collection, getDocs, query, where, doc, updateDoc, runTransaction, getDoc, addDoc } from 'firebase/firestore';

export async function getUsers(role?: 'leader' | 'employee'): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    let q = query(usersCol);
    if (role) {
      q = query(usersCol, where('role', '==', role));
    }
    const userSnapshot = await getDocs(q);
    const userList = userSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
    return userList;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return { ...userDoc.data(), id: userDoc.id } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
}

export async function addUser(userData: Omit<User, 'id' | 'hasDsc'>) {
    const usersCol = collection(db, 'users');

    const q = query(usersCol, where("name", "==", userData.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        throw new Error(`A user with the name "${userData.name}" already exists.`);
    }

    const newUser = {
        name: userData.name,
        role: userData.role,
        password: userData.password,
        hasDsc: false,
    };
    await addDoc(usersCol, newUser);
}


export async function updateUser(userId: string, userData: Partial<Pick<User, 'name' | 'role' | 'password'>>) {
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
    
    transaction.delete(userRef);
  });
}
