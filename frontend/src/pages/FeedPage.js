import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  ToggleButtonGroup,
  ToggleButton,

  TextField,
  InputAdornment,
} from '@mui/material';
import {

  AccessTime as NewIcon,
  FavoriteBorder as LikeIcon,
  ChatBubbleOutline as CommentIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { fetchPosts } from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import ProfileSidecard from '../components/ProfileSidecard';
import { useAppTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

/**
 * FeedPage — main public feed.
 * Features:
 *  - Sort tabs: All Posts / Most Liked / Most Commented
 *  - Infinite-scroll-style pagination (Load More button)
 *  - Optimistic post prepend on create
 *  - Remove deleted posts from local state
 */
const FeedPage = () => {
  const { user } = useAuth();
  const { mode } = useAppTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch posts ──────────────────────────────
  const loadPosts = useCallback(
    async (pageNum = 1, sortMode = sort, reset = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetchPosts(pageNum, sortMode);
        const { posts: newPosts, pagination } = res.data;
        setPosts((prev) => (reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]));
        setHasNextPage(pagination.hasNextPage);
        setPage(pageNum);
      } catch (err) {
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sort]
  );

  useEffect(() => {
    loadPosts(1, sort, true);
    // eslint-disable-next-line
  }, [sort]);

  // ── Sort tab change ──────────────────────────
  const handleSortChange = (_, newSort) => {
    if (!newSort || newSort === sort) return;
    setSort(newSort);
  };

  // ── New post created: prepend to feed ───────
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // ── Post deleted: remove from state ─────────
  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  // ── Search filter (client-side) ─────────────
  const filteredPosts = posts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.text?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q)
    );
  });

  return (
    <Box
      sx={{
        maxWidth: 1024,
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        minHeight: '100vh',
      }}
    >
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* ── Left Sidebar: Profile Card (hidden on mobile) ──── */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <ProfileSidecard />
        </Box>

        {/* ── Main Content: Feed ─────────────────────────────── */}
        <Box sx={{ flexGrow: 1, maxWidth: { xs: '100%', md: 640 }, mx: 'auto' }}>
          {/* Welcome header */}
          <Box
            sx={{
              mb: 4,
              p: 4,
              borderRadius: '24px',
              background: mode === 'light' 
                ? 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(14,165,233,0.1) 100%)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at top right, rgba(37,99,235,0.1), transparent 70%)',
                zIndex: 0,
              }
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, color: 'var(--text-primary)', mb: 1, letterSpacing: '-1px', position: 'relative' }}
            >
              Hi, {user?.username}!
            </Typography>
            <Typography sx={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, position: 'relative' }}>
              Here's what's trending in your hub today.
            </Typography>
          </Box>


      {/* ── Create Post ─────────────────────── */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* ── Search bar ──────────────────────── */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search posts or users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#8a8d91', fontSize: '1.1rem' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#ffffff',
            borderRadius: '12px',
            color: '#050505',
            '& fieldset': { borderColor: '#e4e6eb' },
            '&:hover fieldset': { borderColor: '#1877f2' },
            '&.Mui-focused fieldset': { borderColor: '#1877f2' },
          },
          '& .MuiInputBase-input::placeholder': { color: '#8a8d91' },
        }}
      />

      {/* ── Sort Tabs ───────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={sort}
          exclusive
          onChange={handleSortChange}
          size="small"
          sx={{
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            p: 0.5,
            gap: 1,
            '& .MuiToggleButton-root': {
              color: 'var(--text-secondary)',
              border: 'none',
              borderRadius: '12px !important',
              fontSize: '0.75rem',
              fontWeight: 700,
              px: 2,
              py: 0.75,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: 'var(--brand-blue)',
                color: '#ffffff',
                '&:hover': { bgcolor: 'var(--brand-blue-hover)' },
              },
              '&:hover': { bgcolor: 'var(--bg-card-hover)' },
            },
          }}
        >
          <ToggleButton value="newest">
            <NewIcon sx={{ fontSize: '0.85rem', mr: 0.6 }} />
            Fresh
          </ToggleButton>
          <ToggleButton value="mostLiked">
            <LikeIcon sx={{ fontSize: '0.85rem', mr: 0.6 }} />
            Popular
          </ToggleButton>
          <ToggleButton value="mostCommented">
            <CommentIcon sx={{ fontSize: '0.85rem', mr: 0.6 }} />
            Chatty
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ── Posts Feed ──────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#1877f2' }} />
        </Box>
      ) : filteredPosts.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: '#8a8d91',
          }}
        >
          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>📭</Typography>
          <Typography sx={{ fontWeight: 600, color: '#65676b', mb: 0.5 }}>
            {searchQuery ? 'No matching posts' : 'No posts yet'}
          </Typography>
          <Typography sx={{ fontSize: '0.85rem' }}>
            {searchQuery ? 'Try a different search term' : 'Be the first to share something!'}
          </Typography>
        </Box>
      ) : (
        <>
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
          ))}

          {/* Load More */}
          {hasNextPage && !searchQuery && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Button
                variant="outlined"
                onClick={() => loadPosts(page + 1, sort)}
                disabled={loadingMore}
                sx={{
                  borderColor: '#e4e6eb',
                  color: '#65676b',
                  borderRadius: '12px',
                  px: 4,
                  '&:hover': { borderColor: '#1877f2', color: '#1877f2', bgcolor: 'rgba(79,70,229,0.05)' },
                }}
              >
                {loadingMore ? <CircularProgress size={18} /> : 'Load More'}
              </Button>
            </Box>
          )}

          {!hasNextPage && posts.length > 0 && !searchQuery && (
            <Typography
              sx={{ textAlign: 'center', py: 2, color: '#8a8d91', fontSize: '0.8rem' }}
            >
              ✨ You've seen all posts!
            </Typography>
          )}
        </>
      )}
        </Box>
      </Box>
    </Box>
  );
};

export default FeedPage;
