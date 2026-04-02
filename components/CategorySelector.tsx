import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCategoryList } from '@/hooks/category/useCategoryHooks';
import { useNoteFormStore } from '@/store/useNoteFormStore';

export default function CategorySelector() {
  const isDark = useColorScheme() === 'dark';
  const { data: categories = [] } = useCategoryList();
  const selectedCategoryNo = useNoteFormStore((s) => s.selectedCategoryNo);
  const setSelectedCategoryNo = useNoteFormStore((s) => s.setSelectedCategoryNo);

  const items = [
    { categoryNo: -1, name: '분류되지 않음' },
    ...categories,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {items.map((cat) => {
        const isActive = cat.categoryNo === selectedCategoryNo;
        return (
          <Pressable
            key={cat.categoryNo}
            onPress={() => setSelectedCategoryNo(cat.categoryNo)}
            accessibilityLabel={`카테고리: ${cat.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={[
              styles.chip,
              isActive
                ? styles.chipActive
                : { backgroundColor: isDark ? '#333' : '#f3f4f6' },
            ]}
          >
            {isActive && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
            <Text
              style={[
                styles.chipText,
                isActive
                  ? styles.chipTextActive
                  : { color: isDark ? '#ccc' : '#555' },
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipActive: {
    backgroundColor: '#FF6B6B',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
