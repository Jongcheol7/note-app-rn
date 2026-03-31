import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthGuard } from '@/components/AuthGuard';
import { useFromStore } from '@/store/useFromStore';
import { useThemeColors } from '@/lib/theme';
import NoteLists from '@/modules/notes/NoteLists';
import { useEffect } from 'react';

export default function HomeScreen() {
  const colors = useThemeColors();
  const setMenuFrom = useFromStore((s) => s.setMenuFrom);

  useEffect(() => {
    setMenuFrom('');
  }, []);

  return (
    <AuthGuard showLogin>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top']}
      >
        <NoteLists />
      </SafeAreaView>
    </AuthGuard>
  );
}
