import React, { useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  IconButton,
  Button,
  TextField,
  Collapse,
  Divider,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  FavoriteBorder as LikeIcon,
  Favorite as LikedIcon,
  ChatBubbleOutline as CommentIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { likePost, addComment, deletePost, deleteComment, followUser } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * PostCard
 * Displays a single post with:
 *  - Author avatar, username (@handle), timestamp, Follow button
 *  - Text content
 *  - Image (if any)
 *  - Like toggle (with instant count update)
 *  - Comment count (click to expand inline comments)
 *  - Inline comment input + comments list
 *  - Delete post (for owner)
 */
const PostCard = ({ post: initialPost, onDelete }) => {
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { user, setUser } = useAuth();

  // Derived state
  const isLiked = post.likes?.some(
    (id) => id === user?._id || id?._id === user?._id || id?.toString() === user?._id?.toString()
  );
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const isOwner = post.user?._id === user?._id || post.user === user?._id || post.userId === user?._id ||
    post.user?.toString() === user?._id?.toString();

  const authorId = post.user?._id || post.user || post.userId;
  const isFollowing = user?.following?.some(id => id === authorId || id?._id === authorId) || false;

  // Format timestamp → "Tue, 31 Mar, 2026, 9:58:22 am" style
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // ── Like toggle ────────────────────────────────
  const handleLike = async () => {
    if (likingInProgress) return;
    setLikingInProgress(true);

    // Optimistic update
    const wasLiked = isLiked;
    setPost((prev) => ({
      ...prev,
      likes: wasLiked
        ? prev.likes.filter((id) =>
            (id?.toString?.() || id) !== (user?._id?.toString?.() || user?._id)
          )
        : [...prev.likes, user?._id],
      likedByUsernames: wasLiked
        ? prev.likedByUsernames.filter((u) => u !== user?.username)
        : [...(prev.likedByUsernames || []), user?.username],
    }));

    try {
      await likePost(post._id);
    } catch (err) {
      // Revert on error
      setPost(initialPost);
      toast.error('Failed to update like');
    } finally {
      setLikingInProgress(false);
    }
  };

  // ── Add comment ────────────────────────────────
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await addComment(post._id, commentText.trim());
      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, res.data],
      }));
      setCommentText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // ── Delete post ────────────────────────────────
  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(post._id);
      toast.success('Post deleted');
      onDelete(post._id);
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  // ── Delete comment ─────────────────────────────
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(post._id, commentId);
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  // ── Follow toggle ────────────────────────────
  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!authorId || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await followUser(authorId);
      const nowFollowing = res.data.isFollowing;
      
      // Update global user following state
      setUser(prev => ({
        ...prev,
        following: nowFollowing 
          ? [...(prev.following || []), authorId]
          : (prev.following || []).filter(id => (id?._id || id) !== authorId)
      }));
      
      toast.success(nowFollowing ? `Following @${post.username}` : `Unfollowed @${post.username}`);
    } catch (err) {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  // ── Navigate to user profile ───────────────────
  const goToProfile = () => navigate(`/profile/${post.username}`);

  return (
    <Paper
      elevation={0}
      className="fade-in"
      sx={{
        mb: 2,
        bgcolor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: 'var(--shadow-hover)',
          borderColor: 'rgba(37, 99, 235, 0.5)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* ── Post Header ─────────────────────────── */}
      <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {/* Avatar */}
        <Avatar
          src={post.avatar}
          onClick={goToProfile}
          sx={{
            width: 44,
            height: 44,
            bgcolor: 'var(--brand-blue)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            border: '2px solid var(--border-color)',
            '&:hover': { borderColor: 'var(--brand-blue)' },
            transition: 'border-color 0.2s',
          }}
        >
          {post.username?.[0]?.toUpperCase()}
        </Avatar>

        {/* Name + time */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                '&:hover': { color: 'var(--brand-blue)' },
                fontSize: '0.9rem',
              }}
              onClick={goToProfile}
            >
              {post.username}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}
            >
              @{post.username?.toLowerCase()}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            {formatDate(post.createdAt)}
          </Typography>
        </Box>

        {/* Actions: Follow (for others) or Delete (own posts) */}
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
          {!isOwner && (
            <Button
              size="small"
              variant={isFollowing ? 'outlined' : 'contained'}
              disabled={followLoading}
              sx={{
                bgcolor: isFollowing ? 'transparent' : 'var(--brand-blue)',
                color: isFollowing ? 'var(--brand-blue)' : '#ffffff !important',
                borderColor: isFollowing ? 'var(--brand-blue)' : 'transparent',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                px: 1.5,
                py: 0.4,
                minWidth: isFollowing ? '80px' : '64px',
                '&:hover': { 
                  bgcolor: isFollowing ? 'rgba(37, 99, 235, 0.05)' : 'var(--brand-blue-hover)',
                },
                transition: 'all 0.2s',
              }}
              onClick={handleFollow}
            >
              {followLoading ? <CircularProgress size={14} color="inherit" /> : (isFollowing ? 'Following' : 'Follow')}
            </Button>
          )}
          {isOwner && (
            <Tooltip title="Delete post">
              <IconButton
                size="small"
                onClick={handleDeletePost}
                sx={{ color: '#8a8d91', '&:hover': { color: '#f02849', bgcolor: 'rgba(244,63,94,0.1)' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Post Text ───────────────────────────── */}
      {post.text && (
        <Box sx={{ px: 2, pb: post.image ? 1.5 : 0 }}>
          <Typography
            sx={{
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {post.text}
          </Typography>
        </Box>
      )}

      {/* ── Post Image ──────────────────────────── */}
      {post.image && (
        <Box sx={{ mt: post.text ? 1.5 : 0 }}>
          <img
            src={post.image?.startsWith('/uploads') ? `${process.env.REACT_APP_SERVER_URL}${post.image}` : post.image}
            alt="post"
            style={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Box>
      )}

      {/* ── Liked-by strip ──────────────────────── */}
      {post.likedByUsernames?.length > 0 && (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#8a8d91' }}>
            Liked by{' '}
            <span style={{ color: '#65676b', fontWeight: 600 }}>
              {post.likedByUsernames.slice(0, 3).join(', ')}
            </span>
            {post.likedByUsernames.length > 3 && ` and ${post.likedByUsernames.length - 3} others`}
          </Typography>
        </Box>
      )}

      {/* ── Action Bar ──────────────────────────── */}
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* Like */}
        <Box
          onClick={handleLike}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            color: isLiked ? 'var(--like-color)' : 'var(--text-muted)',
            transition: 'color 0.2s, transform 0.15s',
            '&:hover': { color: 'var(--like-color)', transform: 'scale(1.05)' },
            userSelect: 'none',
          }}
        >
          {isLiked ? (
            <LikedIcon sx={{ fontSize: '1.2rem', animation: isLiked ? 'pulse 0.3s ease' : 'none' }} />
          ) : (
            <LikeIcon sx={{ fontSize: '1.2rem' }} />
          )}
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{likeCount}</Typography>
        </Box>

        {/* Comment */}
        <Box
          onClick={() => setShowComments((p) => !p)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            color: showComments ? '#1877f2' : '#64748b',
            transition: 'color 0.2s',
            '&:hover': { color: '#1877f2' },
            ml: 2,
            userSelect: 'none',
          }}
        >
          <CommentIcon sx={{ fontSize: '1.2rem' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{commentCount}</Typography>
        </Box>
      </Box>

      {/* ── Inline Comments ─────────────────────── */}
      <Collapse in={showComments}>
        <Divider sx={{ borderColor: '#e4e6eb', mx: 2 }} />
        <Box sx={{ px: 2, py: 1.5 }}>
          {/* Add comment input */}
          <Box
            component="form"
            onSubmit={handleAddComment}
            sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}
          >
            <Avatar
              src={user?.avatar}
              sx={{ width: 32, height: 32, bgcolor: '#1877f2', fontSize: '0.75rem', fontWeight: 700 }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment(e);
                }
              }}
              inputProps={{ maxLength: 500 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--bg-input)',
                  borderRadius: '9999px',
                  color: 'var(--text-primary)',
                  fontSize: '0.83rem',
                  '& fieldset': { borderColor: 'var(--border-color)' },
                  '&:hover fieldset': { borderColor: 'var(--brand-blue)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--brand-blue)' },
                },
                '& .MuiInputBase-input::placeholder': { color: 'var(--text-muted)' },
              }}
            />
            <IconButton
              type="submit"
              disabled={!commentText.trim() || commentLoading}
              size="small"
              sx={{
                bgcolor: commentText.trim() ? 'var(--brand-blue)' : 'var(--bg-input)',
                color: '#fff',
                '&:hover': { bgcolor: 'var(--brand-blue-hover)' },
                '&:disabled': { bgcolor: 'var(--bg-input)', color: 'var(--text-muted)' },
                transition: 'all 0.2s',
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Comments list */}
          {post.comments?.length === 0 && (
            <Typography sx={{ fontSize: '0.8rem', color: '#8a8d91', textAlign: 'center', py: 1 }}>
              No comments yet. Be the first!
            </Typography>
          )}
          {post.comments?.map((comment) => (
            <Box
              key={comment._id}
              sx={{
                display: 'flex',
                gap: 1,
                mb: 1,
                p: 1,
                borderRadius: '10px',
                bgcolor: 'var(--bg-input)',
                transition: 'bgcolor 0.2s',
              }}
            >
              <Avatar
                src={comment.avatar}
                sx={{ width: 28, height: 28, bgcolor: '#4294ff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}
              >
                {comment.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {comment.username}
                </Typography>
                <Typography
                  sx={{ fontSize: '0.82rem', color: 'var(--text-secondary)', wordBreak: 'break-word', lineHeight: 1.5 }}
                >
                  {comment.text}
                </Typography>
              </Box>
              {/* Delete comment button */}
              {(comment.user?.toString() === user?._id?.toString() || isOwner) && (
                <Tooltip title="Delete comment">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment._id)}
                    sx={{ color: '#8a8d91', flexShrink: 0, '&:hover': { color: '#f02849' } }}
                  >
                    <DeleteIcon sx={{ fontSize: '0.85rem' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PostCard;
