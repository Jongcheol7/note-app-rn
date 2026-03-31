import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { AuthGuard } from '@/components/AuthGuard';
import { useFromStore } from '@/store/useFromStore';
import NoteLists from '@/modules/notes/NoteLists';
import { useEffect } from 'react';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const setMenuFrom = useFromStore((s) => s.setMenuFrom);

  useEffect(() => {
    setMenuFrom('');
  }, []);

  return (
    <AuthGuard showLogin>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
        edges={['top']}
      >
        <NoteLists />
      </SafeAreaView>
    </AuthGuard>
  );
}
