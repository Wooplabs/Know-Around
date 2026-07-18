import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, SafeAreaView, Platform, Image, Modal, LayoutAnimation, UIManager, Alert } from 'react-native';
import { useKnowAround, Group, GroupPost } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BellIcon, DownIcon, LocationIcon } from '@/components/CustomIcons';

export default function GroupsScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
const { groups, groupPosts, joinGroup, postToGroup, user, darkMode, currentUser, logout, setDarkMode, activeLocation, userAddress } = useKnowAround();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        {/* Uniform Top Header (Group Details) */}
        <View style={[styles.topHeader, darkMode && styles.topHeaderDark]}>
          <View style={styles.headerLeftDetail}>
            <Pressable onPress={() => setSelectedGroup(null)} style={[styles.backBtn, darkMode && styles.backBtnDark]}>
              <Ionicons name="arrow-back" size={24} color={darkMode ? '#ffffff' : '#0C0D0E'} />
            </Pressable>
            <Text style={[styles.headerTitle, darkMode && styles.textWhite]} numberOfLines={1}>
              Group Feed
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={[styles.iconButton, darkMode && styles.iconButtonDark]}>
              <BellIcon color={darkMode ? "#FFFFFF" : "#1A1C1E"} size={25} />
            </Pressable>
            <Pressable onPress={() => setMenuVisible(true)} style={styles.avatarWrapper}>
              <Image source={{ uri: currentUser.avatar }} style={styles.userAvatar} />
              <View style={[styles.avatarBadge, darkMode && styles.avatarBadgeDark]}>
                <Ionicons name="menu-outline" size={8} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* WhatsApp Dropdown Modal Menu (Details View) */}
        <Modal
          transparent
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
            <View style={[styles.dropdownContainer, darkMode && styles.dropdownContainerDark]}>
              {/* Profile mini-card */}
              <View style={[styles.dropdownProfileCard, darkMode && styles.dropdownProfileCardDark]}>
                <Image source={{ uri: currentUser.avatar }} style={styles.dropdownAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownProfileName, darkMode && styles.dropdownProfileNameDark]} numberOfLines={1}>
                    {currentUser.name}
                  </Text>
                  {user?.phone ? (
                    <Text style={styles.dropdownProfilePhone} numberOfLines={1}>{user.phone}</Text>
                  ) : null}
                  {userAddress?.city ? (
                    <Text style={styles.dropdownProfileAddress} numberOfLines={1}>
                      {[userAddress.place, userAddress.city].filter(Boolean).join(', ')}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={[styles.dropdownDivider, darkMode && styles.dropdownDividerDark]} />
              <Pressable style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push('/settings'); }}>
                <Ionicons name="person-outline" size={18} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
                <Text style={[styles.dropdownItemText, darkMode && styles.dropdownItemTextDark]}>Account Settings</Text>
              </Pressable>

              <Pressable 
                style={styles.dropdownItem} 
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setDarkMode(!darkMode);
                }}
              >
                <Ionicons name={darkMode ? "sunny-outline" : "moon-outline"} size={18} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
                <Text style={[styles.dropdownItemText, darkMode && styles.dropdownItemTextDark]}>{darkMode ? "Light Mode" : "Dark Mode"}</Text>
                <View style={[styles.toggleTrack, darkMode && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, darkMode && styles.toggleThumbActive]} />
                </View>
              </Pressable>

              <Pressable style={styles.dropdownItem} onPress={() => { setMenuVisible(false); Alert.alert("Neighborhood Info", "White Town Neighborhood OS v2.0.0"); }}>
                <Ionicons name="information-circle-outline" size={18} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
                <Text style={[styles.dropdownItemText, darkMode && styles.dropdownItemTextDark]}>Neighborhood Info</Text>
              </Pressable>

              <View style={[styles.dropdownDivider, darkMode && styles.dropdownDividerDark]} />

              <Pressable 
                style={[styles.dropdownItem, styles.dropdownItemDestructive]} 
                onPress={() => {
                  setMenuVisible(false);
                  logout();
                }}
              >
                <Ionicons name="log-out-outline" size={18} color="#E53935" />
                <Text style={[styles.dropdownItemText, styles.destructiveText]}>Log Out</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

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

  // Filter Groups List
  const filteredGroups = groups.filter((g) => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group List Directory
  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      {/* Uniform Top Header */}
      <View style={[styles.topHeader, darkMode && styles.topHeaderDark]}>
        <View>
          <Text style={[styles.topHeaderTitle, darkMode && styles.textWhite]}>Groups</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Search Button */}
          <Pressable 
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowSearchBar(!showSearchBar);
            }}
            style={[styles.iconButton, showSearchBar && styles.activeIconButton, darkMode && styles.iconButtonDark]}
          >
            <Ionicons name="search-outline" size={22} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
          </Pressable>

          {/* Dot/Kebab Menu Button */}
          <Pressable onPress={() => setMenuVisible(true)} style={[styles.iconButton, darkMode && styles.iconButtonDark]}>
            <Ionicons name="ellipsis-vertical" size={22} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
          </Pressable>
        </View>
      </View>

      {/* Interactive Search Bar */}
      {showSearchBar && (
        <View style={[styles.searchBarContainer, darkMode && styles.searchBarContainerDark]}>
          <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
            <Ionicons name="search" size={18} color="#60646C" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search groups..."
              placeholderTextColor="#8A9099"
              style={[styles.searchInput, darkMode && styles.textWhite]}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#8A9099" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* WhatsApp Dropdown Modal Menu */}
      <Modal
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={[styles.dropdownContainer, darkMode && styles.dropdownContainerDark]}>
            {/* Profile mini-card */}
            <View style={[styles.dropdownProfileCard, darkMode && styles.dropdownProfileCardDark]}>
              <Image source={{ uri: currentUser.avatar }} style={styles.dropdownAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.dropdownProfileName, darkMode && styles.dropdownProfileNameDark]} numberOfLines={1}>
                  {currentUser.name}
                </Text>
                {user?.phone ? (
                  <Text style={styles.dropdownProfilePhone} numberOfLines={1}>{user.phone}</Text>
                ) : null}
                {userAddress?.city ? (
                  <Text style={styles.dropdownProfileAddress} numberOfLines={1}>
                    {[userAddress.place, userAddress.city].filter(Boolean).join(', ')}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.dropdownDivider, darkMode && styles.dropdownDividerDark]} />
            <Pressable style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push('/settings'); }}>
              <Ionicons name="person-outline" size={18} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
              <Text style={[styles.dropdownItemText, darkMode && styles.dropdownItemTextDark]}>Account Settings</Text>
            </Pressable>

            <Pressable 
              style={styles.dropdownItem} 
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setDarkMode(!darkMode);
              }}
            >
              <Ionicons name={darkMode ? "sunny-outline" : "moon-outline"} size={18} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
              <Text style={[styles.dropdownItemText, darkMode && styles.dropdownItemTextDark]}>{darkMode ? "Light Mode" : "Dark Mode"}</Text>
              <View style={[styles.toggleTrack, darkMode && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, darkMode && styles.toggleThumbActive]} />
              </View>
            </Pressable>

            <Pressable style={styles.dropdownItem} onPress={() => { setMenuVisible(false); Alert.alert("Neighborhood Info", "White Town Neighborhood OS v2.0.0"); }}>
              <Ionicons name="information-circle-outline" size={18} color={darkMode ? "#FFFFFF" : "#1A1C1E"} />
              <Text style={[styles.dropdownItemText, darkMode && styles.dropdownItemTextDark]}>Neighborhood Info</Text>
            </Pressable>

            <View style={[styles.dropdownDivider, darkMode && styles.dropdownDividerDark]} />

            <Pressable 
              style={[styles.dropdownItem, styles.dropdownItemDestructive]} 
              onPress={() => {
                setMenuVisible(false);
                logout();
              }}
            >
              <Ionicons name="log-out-outline" size={18} color="#E53935" />
              <Text style={[styles.dropdownItemText, styles.destructiveText]}>Log Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>



      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, darkMode && styles.textWhite]}>Explore Neighborhood Groups</Text>
        
        {filteredGroups.map((group) => {
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
    backgroundColor: '#F4F6F8',
  },
  safeAreaDark: {
    backgroundColor: '#000000',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1.2,
    borderBottomColor: '#ECEFF1',
  },
  headerContainerDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#2C2C2C',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0C0D0E',
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F5F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backBtnDark: {
    backgroundColor: '#2D2D2D',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C0D0E',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 100, // Cushion for bottom bar
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C0D0E',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Premium high-spread, low-opacity shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 16,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    shadowOpacity: 0,
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

  headerLeftDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 16 : 32,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1.2,
    borderBottomColor: '#ECEFF1',
  },
  topHeaderDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0C0D0E',
    marginLeft: 4,
    marginRight: 4,
  },
  locationTextDark: {
    color: '#E2E8F0',
  },
  downChevron: {
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F5F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDark: {
    backgroundColor: '#2D2D2D',
  },
  avatarWrapper: {
    position: 'relative',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E0E4EC',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 75,
    right: 16,
    width: 230,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  dropdownContainerDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  dropdownProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#F8FBF8',
    borderRadius: 12,
    margin: 4,
  },
  dropdownProfileCardDark: {
    backgroundColor: '#252525',
  },
  dropdownAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1C873C',
  },
  dropdownProfileName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  dropdownProfileNameDark: {
    color: '#ffffff',
  },
  dropdownProfilePhone: {
    fontSize: 11,
    color: '#1C873C',
    fontWeight: '600',
    marginTop: 1,
  },
  dropdownProfileAddress: {
    fontSize: 10,
    color: '#8A9099',
    fontWeight: '500',
    marginTop: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1E',
    flex: 1,
  },
  dropdownItemTextDark: {
    color: '#FFFFFF',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 4,
  },
  dropdownDividerDark: {
    backgroundColor: '#2D2D2D',
  },
  dropdownItemDestructive: {
    marginTop: 2,
  },
  destructiveText: {
    color: '#E53935',
  },
  toggleTrack: {
    width: 34,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#1C873C',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  subHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  subHeaderDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#2C2C2C',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A202C',
  },
  topHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0C0D0E',
  },
  activeIconButton: {
    backgroundColor: '#EAF6EA',
  },
  searchBarContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1.2,
    borderBottomColor: '#ECEFF1',
  },
  searchBarContainerDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#2D2D2D',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchBarDark: {
    backgroundColor: '#2D2D2D',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A202C',
    marginLeft: 8,
    padding: 0,
  },
});
