import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Base Pulsing Skeleton Component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style
}) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

/**
 * Feed Post Skeleton Card
 */
export const PostCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={styles.headerTextCol}>
          <Skeleton width={140} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
          <Skeleton width={90} height={11} borderRadius={5} />
        </View>
        <Skeleton width={60} height={22} borderRadius={12} style={{ marginLeft: 'auto' }} />
      </View>

      {/* Content Text */}
      <View style={styles.contentLines}>
        <Skeleton width="94%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="55%" height={14} borderRadius={6} style={{ marginBottom: 12 }} />
      </View>

      {/* Image Banner */}
      <Skeleton width="100%" height={180} borderRadius={12} style={{ marginBottom: 14 }} />

      {/* Action Footer */}
      <View style={styles.cardFooter}>
        <Skeleton width={70} height={28} borderRadius={14} />
        <Skeleton width={70} height={28} borderRadius={14} />
        <Skeleton width={70} height={28} borderRadius={14} />
        <Skeleton width={32} height={28} borderRadius={14} style={{ marginLeft: 'auto' }} />
      </View>
    </View>
  );
};

/**
 * Professional Service Card Skeleton
 */
export const ProfessionalCardSkeleton: React.FC = () => {
  return (
    <View style={styles.proCardContainer}>
      <Skeleton width={52} height={52} borderRadius={26} />
      <View style={styles.proCardContent}>
        <View style={styles.proRowTop}>
          <Skeleton width={130} height={16} borderRadius={6} />
          <Skeleton width={50} height={20} borderRadius={10} />
        </View>
        <Skeleton width={100} height={12} borderRadius={5} style={{ marginVertical: 6 }} />
        <View style={styles.proMetaRow}>
          <Skeleton width={70} height={12} borderRadius={6} />
          <Skeleton width={80} height={12} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

/**
 * Group Item Card Skeleton
 */
export const GroupCardSkeleton: React.FC = () => {
  return (
    <View style={styles.groupCardContainer}>
      <Skeleton width="100%" height={110} borderRadius={12} style={{ marginBottom: 10 }} />
      <View style={styles.groupCardBody}>
        <Skeleton width={140} height={16} borderRadius={6} style={{ marginBottom: 6 }} />
        <Skeleton width={90} height={12} borderRadius={5} style={{ marginBottom: 10 }} />
        <Skeleton width="100%" height={36} borderRadius={18} />
      </View>
    </View>
  );
};

/**
 * Feed List Loading Skeleton Page
 */
export const FeedListSkeleton: React.FC = () => {
  return (
    <View style={styles.listWrapper}>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </View>
  );
};

/**
 * Directory List Loading Skeleton Page
 */
export const DirectoryListSkeleton: React.FC = () => {
  return (
    <View style={styles.listWrapper}>
      <ProfessionalCardSkeleton />
      <ProfessionalCardSkeleton />
      <ProfessionalCardSkeleton />
      <ProfessionalCardSkeleton />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E2E8F0',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTextCol: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  contentLines: {
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  proCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  proRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  groupCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  groupCardBody: {
    paddingHorizontal: 4,
  },
  listWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
