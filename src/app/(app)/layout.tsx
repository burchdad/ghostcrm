import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}