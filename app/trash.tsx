import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useFromStore } from '@/store/useFromStore';
import TrashList from '@/modules/notes/TrashList';

export default function TrashScreen() {
  const isDark = useColorScheme() === 'dark';
  const setMenuFrom = useFromStore((s) => s.setMenuFrom);

  useEffect(() => {
    setMenuFrom('trash');
    return () => setMenuFrom('');
  }, []);

  return (
    <AuthGuard showLogin>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
        edges={['top']}
      >
        <TrashList />
      </SafeAreaView>
    </AuthGuard>
  );
}
