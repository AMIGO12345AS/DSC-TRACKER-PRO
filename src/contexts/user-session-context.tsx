'use client';

import { createContext, useState, ReactNode, useMemo } from 'react';
import type { User } from '@/types';

interface UserSessionContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

export const UserSessionContext = createContext<UserSessionContextType>({
  selectedUser: null,
  setSelectedUser: () => {},
});

export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const value = useMemo(() => ({ selectedUser, setSelectedUser }), [selectedUser]);

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
};
