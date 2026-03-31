import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

export default function CategoryFilter() {
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const { categoryName, setCategoryName } = useCategoryStore();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!supabase || !user) return [];
      const { data } = await supabase
        .from('category')
        .select('category_no, name')
        .eq('user_id', user.id)
        .order('sort_order');
      return data ?? [];
    },
    enabled: !!user,
  });

  const allItems = [{ name: '전체', category_no: 0 }, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {allItems.map((cat) => {
        const isActive =
          cat.categoryNo === 0 ? categoryName === '' : categoryName === cat.name;

        return (
          <Pressable
            key={cat.categoryNo}
            onPress={() =>
              setCategoryName(cat.categoryNo === 0 ? '' : cat.name)
            }
            style={[
              styles.chip,
              isActive && styles.chipActive,
              !isActive && {
                backgroundColor: isDark ? '#333' : '#f3f4f6',
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                isActive && styles.chipTextActive,
                !isActive && { color: isDark ? '#ccc' : '#555' },
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
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
