import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/lib/AuthContext';
import { OfflineProvider } from '@/lib/offline/OfflineProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfflineProvider>{children}</OfflineProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
