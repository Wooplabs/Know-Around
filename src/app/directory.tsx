import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Linking, Alert } from 'react-native';
import { useKnowAround, Professional, DirectoryItem } from '../context/KnowAroundContext';
import { Ionicons } from '@expo/vector-icons';
import { RoundTickIcon } from '@/components/CustomIcons';
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
  const { professionals, directory, activeLocation } = useKnowAround();
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Local Directory</Text>
          <View style={styles.locationBadge}>
            <Ionicons name="location-sharp" size={14} color="#1C873C" />
            <Text style={styles.locationText}>{activeLocation.split(',')[0]}</Text>
          </View>
        </View>
        
        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#60646C" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Plumber, ATM, Pharmacy..."
            placeholderTextColor="#8A9099"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Horizontal Category Scroller */}
      <View style={styles.categoriesSection}>
        <ScrollViewHorizontal categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {/* Proximity / Distance Slider Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Distance Range: {distanceFilter} km</Text>
        <View style={styles.filterPillRow}>
          {[2, 5, 10, 20].map((d) => (
            <Pressable
              key={d}
              style={[styles.filterPill, distanceFilter === d && styles.activeFilterPill]}
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
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alert-circle-outline" size={48} color="#A0A4AC" />
            <Text style={styles.emptyText}>No local services found matching your filters.</Text>
          </View>
        }
        renderItem={({ item }) => {
          // Inline star builder
          const renderStarsRow = (rating: number) => {
            const stars = [];
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            for (let i = 1; i <= 5; i++) {
              if (i <= fullStars) {
                stars.push(<Ionicons key={i} name="star" size={11} color="#FFB300" />);
              } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={11} color="#FFB300" />);
              } else {
                stars.push(<Ionicons key={i} name="star-outline" size={11} color="#D0D4DC" />);
              }
            }
            return <View style={styles.starsRow}>{stars}</View>;
          };

          const isOpen = item.openStatus === 'Open' || item.availability === 'Available';

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.verified && (
                      <RoundTickIcon color="#1C873C" size={16} style={styles.verifiedIcon} />
                    )}
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                    <Text style={styles.metaDivider}>&middot;</Text>
                    <Text style={styles.distanceBadge}>{item.distance} km</Text>
                    
                    <Text style={styles.metaDivider}>&middot;</Text>
                    <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                      <Text style={[styles.statusBadgeText, isOpen ? styles.statusOpenText : styles.statusClosedText]}>
                        {item.openStatus || item.availability}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.ratingBox}>
                  {renderStarsRow(item.rating)}
                  <Text style={styles.ratingText}>({item.rating})</Text>
                </View>
              </View>

            <Text style={styles.locationDetail}>
              <Ionicons name="location-outline" size={12} color="#8A9099" /> {item.location}
            </Text>

            {/* Quick action buttons */}
            <View style={styles.actions}>
              <Pressable style={[styles.actionBtn, styles.callBtn]} onPress={() => handleCall(item.phone)}>
                <Ionicons name="call" size={16} color="#ffffff" />
                <Text style={styles.actionBtnText}>Call</Text>
              </Pressable>

              {item.isProfessional && item.whatsapp && (
                <Pressable style={[styles.actionBtn, styles.whatsappBtn]} onPress={() => handleWhatsApp(item.whatsapp!)}>
                  <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                  <Text style={styles.actionBtnText}>WhatsApp</Text>
                </Pressable>
              )}

              <Pressable style={[styles.actionBtn, styles.navBtn]} onPress={() => handleNavigate(item.location)}>
                <Ionicons name="navigate-outline" size={16} color="#4A5568" />
                <Text style={[styles.actionBtnText, { color: '#4A5568' }]}>Directions</Text>
              </Pressable>
            </View>
          </View>
        );
      }}
      />
    </View>
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
});
