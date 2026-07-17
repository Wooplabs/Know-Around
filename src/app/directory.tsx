import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Linking, Alert, Image, SafeAreaView, Platform, Modal, LayoutAnimation, UIManager } from 'react-native';
import { useKnowAround, Professional, DirectoryItem } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import { RoundTickIcon, BellIcon, DownIcon, LocationIcon } from '@/components/CustomIcons';
import BottomSheet from '@/components/BottomSheet';

type ItemType = {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: number;
  location: string;
  phone: string;
  isProfessional: boolean;
  verified?: boolean;
  whatsapp?: string;
  availability?: string;
  openStatus?: string;
};

export default function DirectoryScreen() {
  const { professionals, directory, activeLocation, currentUser, logout, darkMode, setDarkMode } = useKnowAround();
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<number>(5);

  const categories = [
    { name: 'All', icon: 'grid-outline' },
    { name: 'Hospital', icon: 'pulse' },
    { name: 'ATM', icon: 'card-outline' },
    { name: 'Medical Shop', icon: 'medical-outline' },
    { name: 'Electrician', icon: 'flash-outline' },
    { name: 'Plumber', icon: 'water-outline' },
    { name: 'AC Technician', icon: 'snow-outline' },
    { name: 'Restaurant', icon: 'restaurant-outline' },
    { name: 'Supermarket', icon: 'basket-outline' },
  ];

  // Map both Professionals and Directory Items into a unified format
  const getUnifiedItems = (): ItemType[] => {
    const list: ItemType[] = [];

    // Add professionals
    professionals.forEach((p) => {
      list.push({
        id: p.id,
        name: p.name,
        category: p.profession,
        rating: p.rating,
        distance: p.distance,
        location: p.location,
        phone: p.phone,
        isProfessional: true,
        verified: p.verified,
        whatsapp: p.whatsapp,
        availability: p.availability,
      });
    });

    // Add directory listings
    directory.forEach((d) => {
      list.push({
        id: d.id,
        name: d.name,
        category: d.category,
        rating: d.rating,
        distance: d.distance,
        location: d.location,
        phone: d.phone,
        isProfessional: false,
        openStatus: d.openStatus,
      });
    });

    return list;
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to make phone call.'));
  };

  const handleWhatsApp = (num: string) => {
    const url = `https://wa.me/91${num}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open WhatsApp.'));
  };

  const handleNavigate = (loc: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc + ', Pondicherry')}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open maps.'));
  };

  // Filter List
  const filteredList = getUnifiedItems().filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDistance = item.distance <= distanceFilter;

    return matchesSearch && matchesCategory && matchesDistance;
  });

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      {/* Uniform Top Header */}
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
        onRequestClose={() => setMenuVisible(false)}
        animationType="fade"
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={[styles.dropdownContainer, darkMode && styles.dropdownContainerDark]}>
            <Pressable style={styles.dropdownItem} onPress={() => { setMenuVisible(false); Alert.alert("Account Settings", "Manage profile, active sessions, and notification priorities."); }}>
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

      {/* Sub Header for Search */}
      <View style={[styles.subHeader, darkMode && styles.subHeaderDark]}>
        {/* Search Input */}
        <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
          <Ionicons name="search" size={18} color="#60646C" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Plumber, ATM, Pharmacy..."
            placeholderTextColor="#8A9099"
            style={[styles.searchInput, darkMode && styles.textWhite]}
          />
        </View>
      </View>

      {/* Horizontal Category Scroller */}
      <View style={styles.categoriesSection}>
        <ScrollViewHorizontal categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {/* Proximity / Distance Slider Filter */}
      <View style={[styles.filterSection, darkMode && styles.filterSectionDark]}>
        <Text style={[styles.filterLabel, darkMode && styles.textWhite]}>Distance Range: {distanceFilter} km</Text>
        <View style={styles.filterPillRow}>
          {[2, 5, 10, 20].map((d) => (
            <Pressable
              key={d}
              style={[styles.filterPill, distanceFilter === d && styles.activeFilterPill, darkMode && styles.filterPillDark]}
              onPress={() => setDistanceFilter(d)}
            >
              <Text style={[styles.filterPillText, distanceFilter === d && styles.activeFilterPillText]}>
                {d} km
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* List items */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DirectoryCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Subcategory Horizontal Helper
function ScrollViewHorizontal({ categories, selected, onSelect }: { categories: any[]; selected: string | null; onSelect: (name: string) => void }) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.catScroll}
      renderItem={({ item }) => {
        const isSelected = selected === item.name || (!selected && item.name === 'All');
        return (
          <Pressable
            style={[styles.catPill, isSelected && styles.activeCatPill]}
            onPress={() => onSelect(item.name)}
          >
            <Ionicons name={item.icon} size={15} color={isSelected ? '#ffffff' : '#60646C'} />
            <Text style={[styles.catText, isSelected && styles.activeCatText]}>{item.name}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6EA',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C873C',
    marginLeft: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A202C',
    marginLeft: 8,
  },
  categoriesSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  activeCatPill: {
    backgroundColor: '#1C873C',
  },
  catText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60646C',
  },
  activeCatText: {
    color: '#ffffff',
  },
  filterSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A9099',
    marginBottom: 8,
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: '#E0E4EC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeFilterPill: {
    backgroundColor: '#EAF6EA',
    borderColor: '#1C873C',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60646C',
  },
  activeFilterPillText: {
    color: '#1C873C',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#8A9099',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  verifiedIcon: {
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#60646C',
  },
  metaDivider: {
    fontSize: 11,
    color: '#A0A4AC',
    marginHorizontal: 4,
  },
  distanceBadge: {
    fontSize: 11,
    color: '#8A9099',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusOpen: {
    backgroundColor: '#EAF6EA',
  },
  statusClosed: {
    backgroundColor: '#FCE8E6',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusOpenText: {
    color: '#1C873C',
  },
  statusClosedText: {
    color: '#E53935',
  },
  ratingBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60646C',
  },
  locationDetail: {
    fontSize: 12,
    color: '#8A9099',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
  },
  callBtn: {
    backgroundColor: '#1C873C',
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
  },
  navBtn: {
    backgroundColor: '#EDF2F7',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  containerDark: {
    backgroundColor: '#000000',
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
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1.2,
    borderBottomColor: '#ECEFF1',
  },
  subHeaderDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#2C2C2C',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0C0D0E',
    marginBottom: 10,
  },
  textWhite: {
    color: '#ffffff',
  },
  searchBarDark: {
    backgroundColor: '#2D2D2D',
  },
  filterSectionDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  filterPillDark: {
    backgroundColor: '#2D2D2D',
  },
});
