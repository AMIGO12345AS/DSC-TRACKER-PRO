'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
    // onIdTokenChanged is the best listener for auth state. It fires on:
    // 1. Sign-in
    // 2. Sign-out
    // 3. Token refresh
    // This ensures the cookie is always kept up-to-date for the middleware.
    const unsubscribeAuth = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // When a user is authenticated, get their token and set/refresh the cookie.
        const token = await firebaseUser.getIdToken();
        document.cookie = `firebaseIdToken=${token}; path=/;`;
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserProfile({
                    id: docSnap.id,
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
        // When user is signed out, clear their profile and ensure the cookie is removed.
        setUserProfile(null);
        document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    }
  }, []);

  const value = { user, userProfile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
