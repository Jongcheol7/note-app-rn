import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
        <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>개인정보처리방침</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.body, { color: isDark ? '#ccc' : '#333' }]}>
{`Notie 개인정보처리방침

최종 수정일: 2026년 3월 31일

1. 수집하는 개인정보
- Google 계정 정보 (이메일, 이름, 프로필 사진)
- 사용자가 작성한 노트, 댓글, 채팅 내용
- 업로드한 이미지 파일
- 서비스 이용 기록 및 접속 로그

2. 개인정보의 이용 목적
- 서비스 제공 및 회원 관리
- 콘텐츠 저장 및 동기화
- 커뮤니티 기능 제공
- 서비스 개선 및 통계 분석

3. 개인정보의 보유 및 파기
- 회원 탈퇴 시 모든 개인정보를 즉시 파기합니다.
- 휴지통의 노트는 30일 후 자동 삭제됩니다.

4. 개인정보의 제3자 제공
- 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
- 법령에 의해 요구되는 경우에 한해 제공할 수 있습니다.

5. 이용자의 권리
- 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.
- 설정 > 계정 삭제를 통해 모든 데이터를 삭제할 수 있습니다.

6. 문의
- 이메일: support@notie.app`}
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
