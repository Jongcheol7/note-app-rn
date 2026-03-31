import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '무료',
    storage: '30MB',
    features: ['기본 노트 작성', '카테고리 관리', '커뮤니티 이용'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '1,900원/월',
    storage: '1GB',
    features: ['Free 모든 기능', '저장 공간 1GB', '우선 지원'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '4,900원/월',
    storage: '3GB',
    features: ['Plus 모든 기능', '저장 공간 3GB', '프리미엄 지원'],
  },
];

export default function PlanScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { profile } = useAuth();
  const currentPlan = profile?.plan || 'free';

  return (
    <AuthGuard showLogin>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>플랜</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                    borderColor: isCurrent ? '#3b82f6' : (isDark ? '#333' : '#e5e7eb'),
                  },
                ]}
              >
                <Text style={[styles.planName, { color: isDark ? '#fff' : '#000' }]}>
                  {plan.name}
                </Text>
                <Text style={[styles.planPrice, { color: isDark ? '#ccc' : '#555' }]}>
                  {plan.price}
                </Text>
                <Text style={styles.planStorage}>저장 공간: {plan.storage}</Text>
                {plan.features.map((feat) => (
                  <View key={feat} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={16} color="#10b981" />
                    <Text style={[styles.featureText, { color: isDark ? '#ccc' : '#555' }]}>
                      {feat}
                    </Text>
                  </View>
                ))}
                <Pressable
                  onPress={() => {
                    if (isCurrent) return;
                    Alert.alert('준비 중', '결제 기능은 준비 중입니다.');
                  }}
                  style={[
                    styles.selectBtn,
                    isCurrent && { backgroundColor: '#e5e7eb' },
                  ]}
                >
                  <Text style={[styles.selectBtnText, isCurrent && { color: '#999' }]}>
                    {isCurrent ? '현재 플랜' : '선택'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16, gap: 16 },
  planCard: {
    padding: 20, borderRadius: 16, borderWidth: 2,
  },
  planName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  planPrice: { fontSize: 16, marginBottom: 8 },
  planStorage: { fontSize: 13, color: '#999', marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  featureText: { fontSize: 14 },
  selectBtn: {
    backgroundColor: '#000', paddingVertical: 12, borderRadius: 10,
    alignItems: 'center', marginTop: 12,
  },
  selectBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
