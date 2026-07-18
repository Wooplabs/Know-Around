import React from 'react';
import { View, StyleSheet, Pressable, Platform, Dimensions, KeyboardAvoidingView } from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  if (!visible) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.overlay} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      pointerEvents="box-none"
    >
      {/* Backdrop to tap and close */}
      <Pressable style={styles.backdrop} onPress={onClose} />
      
      {/* The Sheet Container */}
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  sheet: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    
    // Soft shadow elevation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    width: '100%',
  },
});
