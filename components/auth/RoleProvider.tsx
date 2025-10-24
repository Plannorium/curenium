
'use client';

import { useSession } from 'next-auth/react';
import { createContext, useContext, ReactNode } from 'react';

interface RoleContextType {
  role: string | undefined;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <RoleContext.Provider value={{ role }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};