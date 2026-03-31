import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
        <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>이용약관</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.body, { color: isDark ? '#ccc' : '#333' }]}>
{`Notie 서비스 이용약관

최종 수정일: 2026년 3월 31일

제1조 (목적)
본 약관은 Notie(이하 "서비스")의 이용에 관한 조건과 절차를 규정함을 목적으로 합니다.

제2조 (서비스의 내용)
1. 노트 작성, 편집, 삭제 기능
2. 카테고리 관리 및 검색 기능
3. 커뮤니티 (공개 노트, 좋아요, 댓글)
4. 1:1 채팅 기능
5. 클라우드 동기화 및 오프라인 지원

제3조 (회원가입 및 탈퇴)
1. Google 계정을 통해 가입할 수 있습니다.
2. 회원은 언제든지 서비스 내에서 탈퇴할 수 있습니다.
3. 탈퇴 시 모든 데이터는 즉시 삭제됩니다.

제4조 (이용자의 의무)
1. 타인의 권리를 침해하는 콘텐츠를 게시하지 않아야 합니다.
2. 서비스의 정상적인 운영을 방해하지 않아야 합니다.
3. 관련 법령을 준수해야 합니다.

제5조 (서비스 이용료)
1. 기본 서비스는 무료로 제공됩니다.
2. 추가 저장 공간은 유료 플랜을 통해 이용할 수 있습니다.
  - Free: 30MB
  - Plus: 1GB (월 1,900원)
  - Pro: 3GB (월 4,900원)

제6조 (면책조항)
1. 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.
2. 이용자가 게시한 콘텐츠에 대한 책임은 해당 이용자에게 있습니다.

제7조 (분쟁 해결)
본 약관과 관련된 분쟁은 대한민국 법률에 따라 해결합니다.`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  body: { fontSize: 14, lineHeight: 24 },
});
