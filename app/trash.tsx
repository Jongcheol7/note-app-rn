import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useFromStore } from '@/store/useFromStore';
import { useAuth } from '@/lib/AuthContext';
import { purgeOldTrashNotes } from '@/lib/services/noteService';
import TrashList from '@/modules/notes/TrashList';

export default function TrashScreen() {
  const isDark = useColorScheme() === 'dark';
  const setMenuFrom = useFromStore((s) => s.setMenuFrom);
  const { user } = useAuth();

  useEffect(() => {
    setMenuFrom('trash');
    // Purge once on mount, not on every fetch
    if (user) purgeOldTrashNotes(user.id).catch(() => {});
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
