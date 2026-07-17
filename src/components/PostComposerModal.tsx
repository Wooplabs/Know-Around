import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKnowAround } from '../context/KnowAroundContext';
import BottomSheet from './BottomSheet';

export default function PostComposerModal() {
  const { currentUser, activeLocation, addPost, composerVisible, setComposerVisible } = useKnowAround();
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState<'News' | 'Alert' | 'Event' | 'Community Update'>('Community Update');
  const [postImage, setPostImage] = useState<string | undefined>(undefined);

  const handleCreatePost = () => {
    if (!postText.trim()) return;
    addPost(postText, postCategory, postImage);
    setPostText('');
    setPostImage(undefined);
    setComposerVisible(false);
  };

  const toggleMockImage = () => {
    if (postImage) {
      setPostImage(undefined);
    } else {
      const mockImages = [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800'
      ];
      setPostImage(mockImages[Math.floor(Math.random() * mockImages.length)]);
    }
  };

  if (!currentUser) return null;

  return (
    <BottomSheet visible={composerVisible} onClose={() => setComposerVisible(false)}>
      <View style={styles.composerContainer}>
        {/* Header Row */}
        <View style={styles.composerHeader}>
          <Image source={{ uri: currentUser.avatar }} style={styles.composerAvatar} />
          <View style={styles.composerHeaderMeta}>
            <Text style={styles.composerAuthorName}>{currentUser.name}</Text>
            
            <View style={styles.dropdownSelectorRow}>
              {/* Clickable category cycler */}
              <Pressable 
                style={styles.composerSelectorPill} 
                onPress={() => {
                  const categories = ['Community Update', 'News', 'Alert', 'Event'] as const;
                  const idx = categories.indexOf(postCategory);
                  const next = categories[(idx + 1) % categories.length];
                  setPostCategory(next);
                }}
              >
                <Text style={styles.composerSelectorPillText}>{postCategory}</Text>
                <Ionicons name="chevron-down" size={10} color="#60646C" />
              </Pressable>
              
              {/* Locality Lock Badge */}
              <View style={styles.composerLocalityPill}>
                <Ionicons name="location" size={10} color="#1C873C" />
                <Text style={styles.composerLocalityPillText}>{activeLocation.split(',')[0]}</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.composerCloseButton} onPress={() => setComposerVisible(false)}>
            <Ionicons name="close" size={20} color="#60646C" />
          </Pressable>
        </View>

        {/* Text Area */}
        <TextInput
          style={styles.composerInput}
          value={postText}
          onChangeText={setPostText}
          placeholder={`What's happening in your neighborhood, ${currentUser.name.split(' ')[0]}?`}
          placeholderTextColor="#A0A4AC"
          multiline
        />

        {/* Optional Attachment Preview */}
        {postImage && (
          <View style={styles.previewImageContainer}>
            <Image source={{ uri: postImage }} style={styles.previewImage} />
            <Pressable style={styles.removeImageBtn} onPress={() => setPostImage(undefined)}>
              <Ionicons name="close" size={16} color="#ffffff" />
            </Pressable>
          </View>
        )}

        {/* Facebook-style "Add to your post" attachment bar */}
        <View style={styles.addToPostBar}>
          <Text style={styles.addToPostText}>Add to your post</Text>
          <View style={styles.addToPostIcons}>
            {/* Photo */}
            <Pressable 
              style={[styles.attachmentIconButton, postImage && styles.attachmentIconButtonActive]} 
              onPress={toggleMockImage}
            >
              <Ionicons name="image" size={20} color="#45BD62" />
            </Pressable>
            
            {/* Location */}
            <Pressable style={styles.attachmentIconButton} onPress={() => Alert.alert('Location Locked', `This post is linked to ${activeLocation.split(',')[0]}.`)}>
              <Ionicons name="location" size={20} color="#F55336" />
            </Pressable>

            {/* Tag Neighbors */}
            <Pressable style={styles.attachmentIconButton} onPress={() => Alert.alert('Verify Account', 'Tagging neighbors is only available for verified local members.')}>
              <Ionicons name="people" size={20} color="#1877F2" />
            </Pressable>
          </View>
        </View>

        {/* Publish Trigger */}
        <Pressable 
          style={[styles.postButton, !postText.trim() && styles.postButtonDisabled]} 
          onPress={handleCreatePost}
          disabled={!postText.trim()}
        >
          <Text style={styles.postButtonText}>Publish</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
});
