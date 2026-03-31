import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useCategoryList } from '@/hooks/category/useCategoryHooks';
import { useThemeColors } from '@/lib/theme';

function CategoryChip({
  name,
  isActive,
  onPress,
  colors,
}: {
  name: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: false,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.chip,
          isActive
            ? styles.chipActive
            : { backgroundColor: colors.inputBackground },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            isActive
              ? styles.chipTextActive
              : { color: colors.textSecondary },
          ]}
        >
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function CategoryFilter() {
  const colors = useThemeColors();
  const { categoryName, setCategoryName } = useCategoryStore();
  const { data: categories = [] } = useCategoryList();

  const allItems = [{ name: '전체', categoryNo: 0 }, ...categories];

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.borderLight }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {allItems.map((cat) => {
          const isActive =
            cat.categoryNo === 0 ? categoryName === '' : categoryName === cat.name;

          return (
            <CategoryChip
              key={cat.categoryNo}
              name={cat.name}
              isActive={isActive}
              onPress={() => setCategoryName(cat.categoryNo === 0 ? '' : cat.name)}
              colors={colors}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#FF6B6B',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
