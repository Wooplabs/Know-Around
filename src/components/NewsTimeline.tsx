import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

interface DateItem {
  id: string;
  dayName: string;
  dateNum: number;
  isSelected?: boolean;
}

interface NewsTimelineProps {
  onDateSelect: (dateStr: string) => void;
}

export default function NewsTimeline({ onDateSelect }: NewsTimelineProps) {
  const [selectedDateId, setSelectedDateId] = useState('0');

  // Generate last 6 days
  const getDates = (): DateItem[] => {
    const dates: DateItem[] = [];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        id: String(i),
        dayName: i === 0 ? 'TODAY' : days[d.getDay()],
        dateNum: d.getDate(),
      });
    }
    return dates;
  };

  const datesList = getDates();

  const handleSelect = (item: DateItem) => {
    setSelectedDateId(item.id);
    const dateLabel = item.id === '0' ? 'Today' : `${item.dateNum} Jul`;
    onDateSelect(dateLabel);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Neighborhood News Calendar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {datesList.map((item) => {
          const isSelected = item.id === selectedDateId;
          return (
            <Pressable
              key={item.id}
              style={[
                styles.dateCard,
                isSelected && styles.selectedDateCard,
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {item.dayName}
              </Text>
              <Text style={[styles.numText, isSelected && styles.selectedText]}>
                {item.dateNum}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A9099',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  dateCard: {
    width: 60,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F5F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E4EC',
  },
  selectedDateCard: {
    backgroundColor: '#1C873C',
    borderColor: '#1C873C',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60646C',
    marginBottom: 4,
  },
  numText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
  },
  selectedText: {
    color: '#ffffff',
  },
});
