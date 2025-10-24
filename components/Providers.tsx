
'use client';

import { SessionProvider } from 'next-auth/react';
import { RoleProvider } from '@/components/auth/RoleProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <RoleProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </RoleProvider>
    </SessionProvider>
  );
}