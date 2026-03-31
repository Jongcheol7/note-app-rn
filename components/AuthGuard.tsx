import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/lib/AuthContext';
import LoginScreen from '@/modules/common/LoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  /** If true, shows login screen for unauthenticated users. If false, just returns null. */
  showLogin?: boolean;
}

export function AuthGuard({ children, showLogin = true }: AuthGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return showLogin ? <LoginScreen /> : null;
  }

  return <>{children}</>;
}
