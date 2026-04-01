import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from '@/components/AuthGuard';
import {
  useCategoryList,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
} from '@/hooks/category/useCategoryHooks';

const SAMPLE_CATEGORIES = ['일상', '업무', '공부', '아이디어', '독서', '운동'];

export default function CategoryScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { data: categories = [], isLoading } = useCategoryList();
  const createCategory = useCreateCategory();
  const deleteCat = useDeleteCategory();
  const reorder = useReorderCategories();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    createCategory.mutate(name, {
      onSuccess: () => {
        setNewName('');
        setShowAddModal(false);
      },
      onError: (err: any) => Alert.alert('오류', err.message),
    });
  }, [newName, createCategory]);

  const handleDelete = useCallback(
    (categoryNo: number, name: string) => {
      Alert.alert('삭제', `"${name}" 카테고리를 삭제하시겠습니까?`, [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteCat.mutate(categoryNo),
        },
      ]);
    },
    [deleteCat]
  );

  const moveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === categories.length - 1)
      )
        return;

      const newList = [...categories];
      const swapIdx = direction === 'up' ? index - 1 : index + 1;
      [newList[index], newList[swapIdx]] = [newList[swapIdx], newList[index]];

      const reorderItems = newList.map((cat, i) => ({
        categoryNo: cat.categoryNo,
        sortOrder: i,
      }));
      reorder.mutate(reorderItems);
    },
    [categories, reorder]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <View
        style={[
          styles.categoryItem,
          { borderBottomColor: isDark ? '#333' : '#f0f0f0' },
        ]}
      >
        <View style={styles.reorderBtns}>
          <Pressable onPress={() => moveItem(index, 'up')} hitSlop={8} accessibilityLabel="위로 이동" accessibilityRole="button">
            <Ionicons
              name="chevron-up"
              size={18}
              color={index === 0 ? '#ccc' : isDark ? '#aaa' : '#555'}
            />
          </Pressable>
          <Pressable onPress={() => moveItem(index, 'down')} hitSlop={8} accessibilityLabel="아래로 이동" accessibilityRole="button">
            <Ionicons
              name="chevron-down"
              size={18}
              color={
                index === categories.length - 1
                  ? '#ccc'
                  : isDark
                    ? '#aaa'
                    : '#555'
              }
            />
          </Pressable>
        </View>
        <Text
          style={[styles.categoryName, { color: isDark ? '#fff' : '#000' }]}
        >
          {item.name}
        </Text>
        <Pressable
          onPress={() => handleDelete(item.categoryNo, item.name)}
          hitSlop={8}
          accessibilityLabel={`${item.name} 카테고리 삭제`}
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </Pressable>
      </View>
    ),
    [isDark, categories.length, moveItem, handleDelete]
  );

  return (
    <AuthGuard showLogin>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
        edges={['top']}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? '#000' : '#fff',
              borderBottomColor: isDark ? '#333' : '#eee',
            },
          ]}
        >
          <Pressable onPress={() => router.back()} style={{ padding: 6 }} accessibilityLabel="뒤로 가기" accessibilityRole="button">
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#fff' : '#000'}
            />
          </Pressable>
          <Text
            style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}
            accessibilityRole="header"
          >
            카테고리
          </Text>
          <Pressable onPress={() => setShowAddModal(true)} style={{ padding: 6 }} accessibilityLabel="카테고리 추가" accessibilityRole="button">
            <Ionicons name="add" size={26} color="#3b82f6" />
          </Pressable>
        </View>

        <Text style={styles.hint}>위/아래 버튼으로 순서를 변경하세요</Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.categoryNo)}
            contentContainerStyle={categories.length === 0 ? { flex: 1 } : undefined}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons
                  name="folder-outline"
                  size={48}
                  color={isDark ? '#555' : '#ccc'}
                />
                <Text style={{ color: isDark ? '#666' : '#999', fontSize: 15 }}>
                  카테고리를 추가해보세요
                </Text>
              </View>
            }
          />
        )}

        {/* Add category modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowAddModal(false)}
          >
            <View
              style={[
                styles.addModal,
                { backgroundColor: isDark ? '#1a1a1a' : '#fff' },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? '#fff' : '#000' },
                ]}
              >
                카테고리 추가
              </Text>
              <TextInput
                style={[
                  styles.addInput,
                  {
                    color: isDark ? '#fff' : '#000',
                    backgroundColor: isDark ? '#333' : '#f3f4f6',
                  },
                ]}
                placeholder="카테고리 이름"
                placeholderTextColor="#999"
                value={newName}
                onChangeText={setNewName}
                autoFocus
                onSubmitEditing={handleAdd}
              />
              {/* Sample suggestions */}
              <View style={styles.suggestions}>
                {SAMPLE_CATEGORIES.map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => setNewName(name)}
                    style={[
                      styles.suggestionChip,
                      { backgroundColor: isDark ? '#333' : '#f3f4f6' },
                    ]}
                  >
                    <Text style={{ fontSize: 13, color: isDark ? '#ccc' : '#555' }}>
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={handleAdd}
                disabled={createCategory.isPending}
                style={[
                  styles.addBtn,
                  createCategory.isPending && { opacity: 0.5 },
                ]}
                accessibilityLabel="카테고리 추가 확인"
                accessibilityRole="button"
              >
                <Text style={styles.addBtnText}>추가</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  reorderBtns: { gap: 2 },
  categoryName: { flex: 1, fontSize: 15, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  addModal: {
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  addInput: {
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
