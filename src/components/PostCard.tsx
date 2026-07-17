import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Pressable, TextInput, LayoutAnimation, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post, useKnowAround } from '../context/KnowAroundContext';
import { RoundTickIcon, KebabMenuIcon, LikeIcon, CommentIcon, ShareIcon, BookmarkIcon } from './CustomIcons';

interface PostCardProps {
  post: Post;
  darkMode?: boolean;
}

export default function PostCard({ post, darkMode }: PostCardProps) {
  const { likePost, addComment, bookmarkPost } = useKnowAround();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState(false);

  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    // Spring scaling pop animation
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 90,
        useKnowAroundDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1.0,
        friction: 3,
        tension: 40,
        useKnowAroundDriver: true,
      })
    ]).start();

    likePost(post.id);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  return (
    <View style={[styles.card, darkMode && styles.cardDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, darkMode && styles.nameDark]} numberOfLines={1}>{post.author}</Text>
            {post.verified && (
              <RoundTickIcon color="#3AA832" size={15} style={styles.verifiedIcon} />
            )}
          </View>
          <View style={styles.metaRow}>
            {post.category && (
              <Text style={[
                styles.categoryBadge,
                post.category === 'Alert' ? styles.badge_Alert :
                post.category === 'News' ? styles.badge_News :
                post.category === 'Event' ? styles.badge_Event :
                styles.badge_Community
              ]}>
                {post.category}
              </Text>
            )}
            <Text style={[styles.metaText, darkMode && styles.metaTextDark]} numberOfLines={1}>
              {post.location} &middot; {post.distance} &middot; {post.time}
            </Text>
          </View>
        </View>

        <Pressable style={styles.moreButton}>
          <KebabMenuIcon color={darkMode ? "#A0A4AC" : "#60646C"} size={18} />
        </Pressable>
      </View>

      {/* Content */}
      <Text style={[styles.content, darkMode && styles.contentDark]}>{post.content}</Text>

      {/* Image if available */}
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          {/* Like */}
          <Pressable style={[styles.actionButton, darkMode && styles.actionButtonDark]} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <LikeIcon
                size={22}
                color={post.isLiked ? "#E53935" : (darkMode ? "#A0A4AC" : "#60646C")}
                filled={post.isLiked}
              />
            </Animated.View>
            <Text style={[styles.actionText, darkMode && styles.actionTextDark, post.isLiked && styles.likedText]}>
              {post.likes}
            </Text>
          </Pressable>

          {/* Comment */}
          <Pressable style={[styles.actionButton, darkMode && styles.actionButtonDark]} onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setShowComments(!showComments);
          }}>
            <CommentIcon size={22} color={darkMode ? "#A0A4AC" : "#60646C"} />
            <Text style={[styles.actionText, darkMode && styles.actionTextDark]}>{post.commentsCount}</Text>
          </Pressable>

          {/* Share */}
          <Pressable style={[styles.actionButton, darkMode && styles.actionButtonDark]}>
            <ShareIcon size={22} color={darkMode ? "#A0A4AC" : "#60646C"} />
          </Pressable>
        </View>

        {/* Bookmark */}
        <Pressable style={[styles.actionButton, darkMode && styles.actionButtonDark]} onPress={() => bookmarkPost(post.id)}>
          <BookmarkIcon
            size={22}
            color={post.isBookmarked ? (darkMode ? "#FFFFFF" : "#1A1C1E") : (darkMode ? "#A0A4AC" : "#60646C")}
            filled={post.isBookmarked}
          />
        </Pressable>
      </View>

      {/* Comments Panel */}
      {showComments && (
        <View style={styles.commentsSection}>
          <View style={[styles.divider, darkMode && styles.dividerDark]} />
          
          <View style={styles.commentsInner}>
            {/* Expand/Collapse Button */}
            {post.comments.length > 2 && (
              <Pressable
                style={styles.expandCommentsBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setExpandedComments(!expandedComments);
                }}
              >
                <Text style={styles.expandCommentsText}>
                  {expandedComments ? 'Hide comments' : `Show all ${post.comments.length} comments`}
                </Text>
              </Pressable>
            )}

            {/* Comments List */}
            {(expandedComments ? post.comments : post.comments.slice(0, 2)).map((comment) => (
              <View key={comment.id} style={styles.threadContainer}>
                {/* Twitter Thread Vertical Connector Line */}
                {comment.replies && comment.replies.length > 0 && (
                  <View style={[styles.threadLine, darkMode && styles.threadLineDark]} />
                )}
                
                {/* Parent Comment */}
                <View style={styles.commentRow}>
                  <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                  <View style={[styles.commentContent, darkMode && styles.commentContentDark]}>
                    <View style={styles.commentHeader}>
                      <Text style={[styles.commentAuthor, darkMode && styles.commentAuthorDark]}>{comment.author}</Text>
                      <Text style={[styles.commentTime, darkMode && styles.commentTimeDark]}>{comment.time}</Text>
                    </View>
                    <Text style={[styles.commentText, darkMode && styles.commentTextDark]}>{comment.text}</Text>
                  </View>
                </View>

                {/* Threaded Replies */}
                {comment.replies && comment.replies.map((reply) => (
                  <View key={reply.id} style={styles.replyRow}>
                    <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                    <View style={[styles.replyContent, darkMode && styles.commentContentDark]}>
                      <View style={styles.commentHeader}>
                        <Text style={[styles.commentAuthor, darkMode && styles.commentAuthorDark]}>{reply.author}</Text>
                        <Text style={[styles.commentTime, darkMode && styles.commentTimeDark]}>{reply.time}</Text>
                      </View>
                      <Text style={[styles.commentText, darkMode && styles.commentTextDark]}>{reply.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
          
          {/* Comment Input */}
          <View style={[styles.commentInputRow, darkMode && styles.commentInputRowDark]}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write a comment..."
              placeholderTextColor={darkMode ? "#718096" : "#A0A4AC"}
              style={[styles.commentInput, darkMode && styles.commentInputDark]}
            />
            <Pressable style={styles.sendButton} onPress={handleSendComment}>
              <Ionicons name="send" size={16} color="#3AA832" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    marginBottom: 0,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#2D2D2D',
  },
  nameDark: {
    color: '#FFFFFF',
  },
  metaTextDark: {
    color: '#A0A4AC',
  },
  contentDark: {
    color: '#E2E8F0',
  },
  actionButtonDark: {
    backgroundColor: '#2D2D2D',
  },
  actionTextDark: {
    color: '#A0A4AC',
  },
  dividerDark: {
    backgroundColor: '#2D2D2D',
  },
  commentContentDark: {
    backgroundColor: '#2D2D2D',
  },
  commentAuthorDark: {
    color: '#FFFFFF',
  },
  commentTimeDark: {
    color: '#A0A4AC',
  },
  commentTextDark: {
    color: '#E2E8F0',
  },
  threadLineDark: {
    backgroundColor: '#2D2D2D',
  },
  commentInputRowDark: {
    borderTopColor: '#2D2D2D',
    backgroundColor: '#1E1E1E',
  },
  commentInputDark: {
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#60646C',
    fontWeight: '500',
    flexShrink: 1,
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: '800',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  badge_Alert: {
    color: '#E53935',
    backgroundColor: '#FFEBEE',
  },
  badge_News: {
    color: '#1E88E5',
    backgroundColor: '#E3F2FD',
  },
  badge_Event: {
    color: '#8E24AA',
    backgroundColor: '#F3E5F5',
  },
  badge_Community: {
    color: '#43A047',
    backgroundColor: '#E8F5E9',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  meta: {
    fontSize: 13,
    color: '#60646C',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 16,
    color: '#1A1C1E',
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  postImage: {
    width: '100%',
    height: 320,
    borderRadius: 0, // Full bleed fit-width
    marginBottom: 12,
    backgroundColor: '#E0E0E0',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F4F5F7',
    borderRadius: 20,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60646C',
  },
  likedText: {
    color: '#E53935',
  },
  commentsSection: {
    marginTop: 12,
  },
  commentsInner: {
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginBottom: 12,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#E0E0E0',
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  commentTime: {
    fontSize: 11,
    color: '#60646C',
  },
  commentText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
  },
  commentInput: {
    flex: 1,
    height: 32,
    fontSize: 13,
    color: '#1A1C1E',
    padding: 0,
  },
  sendButton: {
    padding: 4,
  },
  expandCommentsBtn: {
    paddingVertical: 4,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expandCommentsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3AA832',
  },
  threadContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  threadLine: {
    position: 'absolute',
    left: 15, // Centered behind the 32px parent avatar
    top: 32,  // Starts below parent avatar
    bottom: 24, // Ends near the start of the last reply
    width: 2,
    backgroundColor: '#E2E8F0', // Vertical connector color
    zIndex: 1,
  },
  replyRow: {
    flexDirection: 'row',
    marginLeft: 36, // Indent for Twitter reply
    marginTop: 8,
    zIndex: 2,
  },
  replyAvatar: {
    width: 26, // Slightly smaller than parent avatar
    height: 26,
    borderRadius: 13,
    marginRight: 10,
    backgroundColor: '#E0E0E0',
  },
  replyContent: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    padding: 10,
  },
});
