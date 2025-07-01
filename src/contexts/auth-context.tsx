'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as UserProfile } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Query for the user document where the 'uid' field matches the authenticated user's UID.
        // This is more robust than assuming the document ID is the UID.
        const usersQuery = query(collection(db, 'users'), where('uid', '==', firebaseUser.uid), limit(1));
        
        const unsubscribeProfile = onSnapshot(usersQuery, (querySnapshot) => {
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const data = userDoc.data();
                setUserProfile({
                    id: userDoc.id,
                    uid: data.uid,
                    name: data.name,
                    role: data.role,
                    hasDsc: data.hasDsc
                } as UserProfile);
            } else {
                console.warn(`Firestore profile not found for authenticated user ${firebaseUser.uid}`);
                setUserProfile(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user profile:", error);
            setUserProfile(null);
            setLoading(false);
        });

        return () => unsubscribeProfile();

      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Set cookie for middleware
    const setToken = async () => {
        const currentUser = auth.currentUser;
        if(currentUser) {
            const token = await currentUser.getIdToken();
            document.cookie = `firebaseIdToken=${token}; path=/;`;
        } else {
            document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }
    
    const tokenRefreshInterval = setInterval(setToken, 10 * 60 * 1000); // Refresh every 10 mins
    setToken();


    return () => {
      unsubscribeAuth();
      clearInterval(tokenRefreshInterval);
    }
  }, []);

  const value = { user, userProfile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
