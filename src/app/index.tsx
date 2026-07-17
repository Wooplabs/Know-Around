import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, TextInput, ScrollView, SafeAreaView, Platform, LayoutAnimation, UIManager, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useKnowAround, Post } from '../context/KnowAroundContext';
import PostCard from '../components/PostCard';
import { BellIcon, DownIcon, PlusIcon, ImagesIcon, LocationIcon, RoundTickIcon } from '@/components/CustomIcons';
import BottomSheet from '@/components/BottomSheet';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import NewsTimeline from '@/components/NewsTimeline';

export default function HomeScreen() {
  const { currentUser, activeLocation, feeds, alerts, logout, darkMode, setDarkMode } = useKnowAround();
  
  // States
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'News' | 'Alert' | 'Event' | 'Community Update'>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('Today');
  const [ignoredAlerts, setIgnoredAlerts] = useState<string[]>([]);
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const lastScrollY = useRef(0);

  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Only hide if we have scrolled down past a minimum threshold (e.g. 80px)
    if (currentY > 80) {
      if (diff > 10 && showFilterBar) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowFilterBar(false);
      } else if (diff < -10 && !showFilterBar) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowFilterBar(true);
      }
    } else if (currentY <= 10 && !showFilterBar) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowFilterBar(true);
    }
    lastScrollY.current = currentY;
  };

  // Filter Feed Posts
  const filteredFeeds = feeds.filter((post) => {
    const matchesCategory = selectedFilter === 'All' || post.category === selectedFilter;
    
    // If news category is selected, simulate filtering by date (e.g. mock filters)
    if (selectedFilter === 'News' && selectedDateFilter !== 'Today') {
      return post.category === 'News' && post.time !== 'Just now' && post.time !== '2d';
    }
    
    return matchesCategory;
  });

  // Get most critical active alert to pin at the top
  const topDangerAlert = alerts.find(a => a.level === 'danger');

  // Filter labels helper to prevent typos like 'Alls' and 'Newss'
  const getFilterLabel = (filter: string) => {
    if (filter === 'All') return 'All';
    if (filter === 'News') return 'News';
    if (filter === 'Alert') return 'Alerts';
    if (filter === 'Event') return 'Events';
    if (filter === 'Community Update') return 'Updates';
    return filter;
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      {/* Top Header */}
      <View style={[styles.topHeader, darkMode && styles.topHeaderDark]}>
        <View>
          <Pressable style={styles.locationSelector}>
            <LocationIcon color={darkMode ? "#A0A4AC" : "#60646C"} size={18} />
            <Text style={[styles.locationText, darkMode && styles.locationTextDark]}>{activeLocation.split(',')[0]}</Text>
            <DownIcon color={darkMode ? "#A0A4AC" : "#60646C"} size={15} style={styles.downChevron} />
          </Pressable>
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

      {/* WhatsApp Dropdown Modal Menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={[styles.dropdownContainer, darkMode && styles.dropdownContainerDark]}>
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

      {/* Categories Filter Strip */}
      {showFilterBar && (
        <View style={[styles.filterSection, darkMode && styles.filterSectionDark]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['All', 'News', 'Alert', 'Event', 'Community Update'] as const).map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterPill, 
                    darkMode && styles.filterPillDark,
                    isSelected && styles.activeFilterPill,
                    isSelected && darkMode && styles.activeFilterPillDark
                  ]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setSelectedFilter(filter);
                  }}
                >
                  <Text style={[
                    styles.filterPillText, 
                    darkMode && styles.filterPillTextDark,
                    isSelected && styles.activeFilterPillText,
                    isSelected && darkMode && styles.activeFilterPillTextDark
                  ]}>
                    {getFilterLabel(filter)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Episodic News Timeline Scroller */}
      {selectedFilter === 'News' && (
        <NewsTimeline onDateSelect={setSelectedDateFilter} />
      )}

      <ScrollView 
        style={[styles.scrollView, darkMode && styles.scrollViewDark]} 
        contentContainerStyle={[styles.scrollContent, darkMode && styles.scrollContentDark]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Critical Announcement Banner */}
        {topDangerAlert && !ignoredAlerts.includes(topDangerAlert.id) && (
          <View style={[styles.alertBanner, darkMode && styles.alertBannerDark]}>
            <View style={styles.alertIndicatorBar} />
            <View style={styles.alertContentContainer}>
              <View style={styles.alertHeader}>
                <Image 
                  source={{ uri: topDangerAlert.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' }} 
                  style={styles.alertAvatar} 
                />
                <View style={styles.alertAuthorInfo}>
                  <View style={styles.alertAuthorRow}>
                    <Text style={[styles.alertAuthorName, darkMode && styles.alertAuthorNameDark]}>{topDangerAlert.author || 'Municipal Guard'}</Text>
                    {topDangerAlert.verified && (
                      <RoundTickIcon color="#1C873C" size={13} style={{ marginLeft: 3 }} />
                    )}
                  </View>
                  <Text style={[styles.alertMetaText, darkMode && styles.alertMetaTextDark]}>{topDangerAlert.location} &middot; {topDangerAlert.time}</Text>
                </View>
                
                <Pressable 
                  style={styles.alertIgnoreButton} 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIgnoredAlerts([...ignoredAlerts, topDangerAlert.id]);
                  }}
                >
                  <Text style={styles.alertIgnoreText}>Ignore</Text>
                </Pressable>
              </View>

              <View style={styles.alertBody}>
                <Text style={[styles.alertTitleText, darkMode && styles.alertTitleTextDark]}>{topDangerAlert.title}</Text>
                <Text style={[styles.alertBannerDesc, darkMode && styles.alertBannerDescDark]}>{topDangerAlert.description}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Home Feed Posts */}
        {filteredFeeds.map((post) => (
          <PostCard key={post.id} post={post} darkMode={darkMode} />
        ))}

        {filteredFeeds.length === 0 && (
          <View style={styles.emptyFeed}>
            <Ionicons name="newspaper-outline" size={48} color="#A0A4AC" />
            <Text style={styles.emptyFeedText}>No updates in this category right now.</Text>
          </View>
        )}
      </ScrollView>



    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 42 : 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C873C',
    letterSpacing: -0.5,
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
  filterSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeFilterPill: {
    backgroundColor: '#EAF6EA',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60646C',
  },
  activeFilterPillText: {
    color: '#1C873C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 0,
    gap: 0,
    paddingBottom: 100, // Offset for floating tab bar capsule
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  alertIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#EF4444',
  },
  alertContentContainer: {
    flex: 1,
    paddingLeft: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#E0E0E0',
  },
  alertAuthorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  alertAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  alertMetaText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
    marginTop: 1,
  },
  alertIgnoreButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  alertIgnoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  alertBody: {
    marginTop: 2,
  },
  alertTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9F1239',
    marginBottom: 4,
  },
  alertBannerDesc: {
    fontSize: 13,
    color: '#4C0519',
    fontWeight: '600',
    lineHeight: 19,
  },
  feedCardContainer: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  postCategoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C873C',
    backgroundColor: '#EAF6EA',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  proximityBadge: {
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proximityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60646C',
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyFeedText: {
    fontSize: 14,
    color: '#8A9099',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 92, // Floating right above custom bottom navigation capsule
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C873C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C873C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  composerContainer: {
    width: '100%',
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  composerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  composerHeaderMeta: {
    flex: 1,
  },
  composerAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  dropdownSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  composerSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  composerSelectorPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60646C',
  },
  composerLocalityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6EA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  composerLocalityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C873C',
  },
  composerCloseButton: {
    padding: 8,
  },
  composerInput: {
    backgroundColor: '#ffffff',
    fontSize: 15,
    color: '#1A202C',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    padding: 0,
  },
  previewImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 14,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToPostBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  addToPostText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
  },
  addToPostIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentIconButtonActive: {
    backgroundColor: '#EAF6EA',
  },
  postButton: {
    backgroundColor: '#1C873C',
    borderRadius: 22,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#A0DCA0',
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  safeAreaDark: {
    backgroundColor: '#121212',
  },
  topHeaderDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  brandTitleDark: {
    color: '#4ade80',
  },
  locationTextDark: {
    color: '#E2E8F0',
  },
  iconButtonDark: {
    backgroundColor: '#2D2D2D',
  },
  avatarBadgeDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
  },
  filterSectionDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  filterPillDark: {
    backgroundColor: '#2D2D2D',
  },
  activeFilterPillDark: {
    backgroundColor: '#1B4D22',
  },
  filterPillTextDark: {
    color: '#A0A4AC',
  },
  activeFilterPillTextDark: {
    color: '#4ade80',
  },
  scrollViewDark: {
    backgroundColor: '#121212',
  },
  scrollContentDark: {
    backgroundColor: '#121212',
  },
  alertBannerDark: {
    backgroundColor: '#2d1a1a',
    borderColor: '#4a2424',
  },
  alertAuthorNameDark: {
    color: '#FFFFFF',
  },
  alertMetaTextDark: {
    color: '#A0A4AC',
  },
  alertTitleTextDark: {
    color: '#FCA5A5',
  },
  alertBannerDescDark: {
    color: '#FECACA',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 75,
    right: 16,
    width: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    backgroundColor: '#4ade80',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
