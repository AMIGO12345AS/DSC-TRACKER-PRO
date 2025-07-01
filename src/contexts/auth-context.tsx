'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getUserProfile } from '@/services/user';
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
        // Now also listen for realtime updates on the user's profile
        const profileDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(profileDocRef, (doc) => {
          if (doc.exists()) {
             const data = doc.data();
             setUserProfile({
                id: doc.id,
                uid: firebaseUser.uid,
                name: data.name,
                role: data.role,
                hasDsc: data.hasDsc
             } as UserProfile);
          } else {
            // This can happen if the user is deleted from Firestore but not Auth
            setUserProfile(null);
          }
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
