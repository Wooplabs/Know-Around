import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform
} from 'react-native';
import { useKnowAround, Group, GroupPost } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';

export default function GroupsScreen() {
  const { groups, groupPosts, joinGroup, postToGroup, user, darkMode } = useKnowAround();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userEmail = user?.email || 'neighbor@gmail.com';

  const handleJoinGroup = async (groupId: string) => {
    await joinGroup(groupId);
  };

  const handlePostSubmit = async () => {
    if (!selectedGroup || !newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      await postToGroup(selectedGroup.id, newPostContent);
      setNewPostContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group Details View
  if (selectedGroup) {
    const isMember = selectedGroup.members?.includes(userEmail) || false;
    const posts = groupPosts.filter(p => p.groupId === selectedGroup.id);

    return (
      <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
        {/* Header */}
        <View style={[styles.detailHeader, darkMode && styles.detailHeaderDark]}>
          <Pressable onPress={() => setSelectedGroup(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={darkMode ? '#ffffff' : '#0C0D0E'} />
          </Pressable>
          <Text style={[styles.headerTitle, darkMode && styles.textWhite]} numberOfLines={1}>
            {selectedGroup.name}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Group Banner Info */}
          <View style={[styles.groupBanner, darkMode && styles.cardDark]}>
            <Text style={styles.bannerEmoji}>{selectedGroup.image}</Text>
            <Text style={[styles.groupTitleText, darkMode && styles.textWhite]}>{selectedGroup.name}</Text>
            <Text style={styles.categoryBadge}>{selectedGroup.category}</Text>
            <Text style={[styles.groupDescText, darkMode && styles.textGrey]}>{selectedGroup.description}</Text>
            
            <View style={styles.memberRow}>
              <Ionicons name="people" size={16} color="#A0A4AC" />
              <Text style={styles.memberCountText}>
                {selectedGroup.membersCount} members
              </Text>
            </View>

            {!isMember ? (
              <Pressable style={styles.joinActionBtn} onPress={() => handleJoinGroup(selectedGroup.id)}>
                <Text style={styles.joinActionBtnText}>Join Group</Text>
              </Pressable>
            ) : (
              <View style={styles.joinedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#1C873C" />
                <Text style={styles.joinedBadgeText}>Joined</Text>
              </View>
            )}
          </View>

          {/* Group Feed Header */}
          <Text style={[styles.sectionTitle, darkMode && styles.textWhite]}>Discussion Board</Text>

          {/* Post Composer (Only shown to members) */}
          {isMember ? (
            <View style={[styles.composerCard, darkMode && styles.cardDark]}>
              <TextInput
                value={newPostContent}
                onChangeText={setNewPostContent}
                placeholder="Share something with the group..."
                placeholderTextColor="#A0A4AC"
                multiline
                style={[styles.composerInput, darkMode && styles.inputDark]}
              />
              <View style={styles.composerActionRow}>
                <Pressable
                  style={[styles.postBtn, !newPostContent.trim() && styles.postBtnDisabled]}
                  onPress={handlePostSubmit}
                  disabled={!newPostContent.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={16} color="#ffffff" />
                      <Text style={styles.postBtnText}>Post Update</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={[styles.lockCard, darkMode && styles.cardDark]}>
              <Ionicons name="lock-closed" size={24} color="#A0A4AC" />
              <Text style={styles.lockText}>Only group members can read and write posts.</Text>
            </View>
          )}

          {/* Group Feed Posts */}
          {isMember && (
            posts.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyFeedText}>No posts yet. Be the first to start a conversation!</Text>
              </View>
            ) : (
              posts.map((post) => (
                <View key={post.id} style={[styles.postCard, darkMode && styles.cardDark]}>
                  <View style={styles.postHeader}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {post.authorName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.authorInfo}>
                      <Text style={[styles.authorNameText, darkMode && styles.textWhite]}>
                        {post.authorName}
                      </Text>
                      <Text style={styles.postTimeText}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.postContentText, darkMode && styles.textWhite]}>
                    {post.content}
                  </Text>
                </View>
              ))
            )
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Group List Directory
  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      {/* Page Header */}
      <View style={[styles.headerContainer, darkMode && styles.headerContainerDark]}>
        <Text style={[styles.brandTitle, darkMode && styles.textWhite]}>Community Groups</Text>
        <Text style={styles.brandSubtitle}>Connect with neighbors sharing your interests</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, darkMode && styles.textWhite]}>Explore Neighborhood Groups</Text>
        
        {groups.map((group) => {
          const isMember = group.members?.includes(userEmail) || false;
          return (
            <Pressable
              key={group.id}
              style={[styles.groupCard, darkMode && styles.cardDark]}
              onPress={() => setSelectedGroup(group)}
            >
              <View style={styles.groupCardHeader}>
                <Text style={styles.groupEmoji}>{group.image}</Text>
                <View style={styles.groupInfo}>
                  <Text style={[styles.groupNameText, darkMode && styles.textWhite]}>
                    {group.name}
                  </Text>
                  <Text style={styles.groupCategoryText}>{group.category}</Text>
                </View>
                {isMember && (
                  <View style={styles.joinedSmallBadge}>
                    <Ionicons name="checkmark" size={12} color="#1C873C" />
                    <Text style={styles.joinedSmallText}>Joined</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.groupDescription, darkMode && styles.textGrey]} numberOfLines={2}>
                {group.description}
              </Text>

              <View style={styles.groupCardFooter}>
                <Text style={styles.groupMembersCount}>
                  {group.membersCount} members
                </Text>
                <Pressable
                  style={[styles.joinBtn, isMember && styles.joinedBtn]}
                  onPress={() => handleJoinGroup(group.id)}
                >
                  <Text style={[styles.joinBtnText, isMember && styles.joinedBtnText]}>
                    {isMember ? 'Joined' : 'Join'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  safeAreaDark: {
    backgroundColor: '#000000',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 16 : 32,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1.2,
    borderBottomColor: '#ECEFF1',
  },
  headerContainerDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#2C2C2C',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C873C',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A94A6',
    marginTop: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailHeaderDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#2C2C2C',
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C0D0E',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Cushion for bottom bar
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C0D0E',
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    // Soft shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: '#121212',
    borderColor: '#2C2C2C',
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C0D0E',
  },
  groupCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C873C',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  joinedSmallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  joinedSmallText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C873C',
    marginLeft: 3,
  },
  groupDescription: {
    fontSize: 13,
    color: '#60646C',
    lineHeight: 18,
    marginBottom: 16,
  },
  groupCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingTop: 12,
  },
  groupMembersCount: {
    fontSize: 12,
    color: '#A0A4AC',
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  joinedBtn: {
    backgroundColor: '#ECEFF1',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  joinedBtnText: {
    color: '#60646C',
  },
  groupBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  bannerEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  groupTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0C0D0E',
    textAlign: 'center',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C873C',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 12,
  },
  groupDescText: {
    fontSize: 14,
    color: '#60646C',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  memberCountText: {
    fontSize: 13,
    color: '#8A94A6',
    fontWeight: '600',
  },
  joinActionBtn: {
    backgroundColor: '#1C873C',
    borderRadius: 24,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 24,
    width: '100%',
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 6,
  },
  joinedBadgeText: {
    color: '#1C873C',
    fontSize: 14,
    fontWeight: '800',
  },
  composerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  composerInput: {
    fontSize: 14,
    color: '#0C0D0E',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  composerActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingTop: 12,
    marginTop: 12,
  },
  postBtn: {
    backgroundColor: '#1C873C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  postBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  postBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  lockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  lockText: {
    color: '#8A94A6',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFeedText: {
    color: '#8A94A6',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C873C',
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C0D0E',
  },
  postTimeText: {
    fontSize: 11,
    color: '#A0A4AC',
    marginTop: 2,
  },
  postContentText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  textWhite: {
    color: '#ffffff',
  },
  textGrey: {
    color: '#8A94A6',
  },
  inputDark: {
    color: '#ffffff',
  },
});
