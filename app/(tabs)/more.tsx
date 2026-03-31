import { View, Text, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  action?: () => void;
}

export default function MoreScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const menuItems: MenuItem[] = [
    { icon: 'calendar-outline', label: '캘린더', route: '/calendar' },
    { icon: 'trash-outline', label: '휴지통', route: '/trash' },
    { icon: 'folder-outline', label: '카테고리', route: '/category' },
    { icon: 'settings-outline', label: '설정', route: '/settings' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: isDark ? '#fff' : '#000', marginBottom: 20 }}>
          더보기
        </Text>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              if (item.route) router.push(item.route as any);
              if (item.action) item.action();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#333' : '#f0f0f0',
            }}
          >
            <Ionicons name={item.icon} size={22} color={isDark ? '#ccc' : '#555'} />
            <Text style={{ fontSize: 16, marginLeft: 14, color: isDark ? '#fff' : '#000' }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={user ? signOut : () => {}}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
          }}
        >
          <Ionicons
            name={user ? 'log-out-outline' : 'log-in-outline'}
            size={22}
            color={isDark ? '#ccc' : '#555'}
          />
          <Text style={{ fontSize: 16, marginLeft: 14, color: isDark ? '#fff' : '#000' }}>
            {user ? '로그아웃' : '로그인'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
