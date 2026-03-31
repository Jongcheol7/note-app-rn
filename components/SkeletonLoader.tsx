import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useThemeColors } from '@/lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Skeleton placeholder for a note card grid */
export function NoteCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={14} width="70%" />
      <Skeleton height={12} width="100%" style={{ marginTop: 8 }} />
      <Skeleton height={12} width="85%" style={{ marginTop: 4 }} />
      <Skeleton height={12} width="40%" style={{ marginTop: 4 }} />
      <View style={styles.cardFooter}>
        <Skeleton height={10} width={40} />
      </View>
    </View>
  );
}

/** Skeleton placeholder for note list */
export function NoteListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </View>
  );
}

/** Skeleton for a single detail screen */
export function DetailSkeleton() {
  return (
    <View style={styles.detail}>
      <Skeleton height={24} width="60%" />
      <Skeleton height={14} width="100%" style={{ marginTop: 16 }} />
      <Skeleton height={14} width="90%" style={{ marginTop: 8 }} />
      <Skeleton height={14} width="95%" style={{ marginTop: 8 }} />
      <Skeleton height={14} width="70%" style={{ marginTop: 8 }} />
      <Skeleton height={200} width="100%" borderRadius={12} style={{ marginTop: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    padding: 14,
    minHeight: 120,
    borderRadius: 12,
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  detail: {
    padding: 16,
  },
});
