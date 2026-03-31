import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useFromStore } from '@/store/useFromStore';
import NoteLists from '@/modules/notes/NoteLists';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginScreen from '@/modules/common/LoginScreen';

export default function CommunityScreen() {
  const isDark = useColorScheme() === 'dark';
  const setMenuFrom = useFromStore((s) => s.setMenuFrom);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    setMenuFrom('community');
  }, []);

  if (!isLoading && !user) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
      edges={['top']}
    >
      <NoteLists />
    </SafeAreaView>
  );
}
