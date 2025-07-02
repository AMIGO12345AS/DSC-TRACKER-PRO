'use client';

import { useContext } from 'react';
import { UserSessionContext } from '@/contexts/user-session-context';

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
};
