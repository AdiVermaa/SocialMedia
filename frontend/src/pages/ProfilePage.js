import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';

import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, followUser, updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

/**
 * ProfilePage — shows a user's public profile with their posts.
 * Includes: avatar, username, bio, follow/unfollow button, post count.
 */
const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getUserProfile(username);
        setProfile(res.data.user);
        setPosts(res.data.posts);
        // Check if current user follows this profile
        setFollowing(
          res.data.user.followers?.some(
            (id) => id?.toString() === currentUser?._id?.toString()
          ) || false
        );
      } catch (err) {
        toast.error('User not found');
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, currentUser?._id, navigate]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const res = await followUser(profile._id);
      setFollowing(res.data.isFollowing);
      setProfile((prev) => ({
        ...prev,
        followers: res.data.isFollowing
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(
              (id) => id?.toString() !== currentUser._id?.toString()
            ),
      }));
      toast.success(res.data.isFollowing ? 'Following!' : 'Unfollowed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to follow');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleAvatarUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await updateProfile(formData);
      setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
      
      // Update global user state in AuthContext if possible
      // (assuming useAuth provides a way to refresh or update user)
      // If not, we just update the local profile view
      toast.success('Profile picture updated!');
      
      // Reload page to sync global state if no update function exists
      window.location.reload(); 
    } catch (err) {
      toast.error('Failed to update profile picture');
    } finally {
      setUpdating(false);
    }
  };

  const isOwnProfile = profile?._id?.toString() === currentUser?._id?.toString();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1877f2' }} />
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 3 }}>
      {/* ── Profile Card ─────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'var(--bg-card)',
          border: '1px solid #e4e6eb',
          borderRadius: '20px',
          overflow: 'hidden',
          mb: 2.5,
        }}
      >
        {/* Cover gradient */}
        <Box
          sx={{
            height: 120,
            background: 'var(--brand-gradient)',
          }}
        />

        {/* Content */}
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Avatar pulled up */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mt: -6,
              mb: 2,
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile.avatar?.startsWith('/uploads') ? `${process.env.REACT_APP_SERVER_URL}${profile.avatar}` : profile.avatar}
                sx={{
                  width: 110,
                  height: 110,
                  border: '6px solid var(--bg-card)',
                  bgcolor: 'var(--brand-blue)',
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                {profile.username?.[0]?.toUpperCase()}
              </Avatar>
              {isOwnProfile && (
                <>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpdate}
                  />
                  <Button
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updating}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 4,
                      minWidth: 36,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'var(--brand-blue)',
                      color: '#fff',
                      border: '3px solid var(--bg-card)',
                      boxShadow: 'var(--shadow-card)',
                      '&:hover': { bgcolor: 'var(--brand-blue-hover)', transform: 'scale(1.1)' },
                      transition: 'all 0.2s',
                      p: 0,
                    }}
                  >
                    {updating ? <CircularProgress size={16} color="inherit" /> : '✎'}
                  </Button>
                </>
              )}
            </Box>

            {/* Follow / Edit Profile button */}
            {!isOwnProfile ? (
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                variant={following ? 'outlined' : 'contained'}
                size="small"
                sx={{
                  borderRadius: '9999px',
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  bgcolor: following ? 'transparent' : 'var(--brand-blue)',
                  borderColor: following ? 'var(--brand-blue)' : 'transparent',
                  color: following ? 'var(--brand-blue)' : '#fff',
                  '&:hover': {
                    bgcolor: following ? 'rgba(37, 99, 235, 0.1)' : 'var(--brand-blue-hover)',
                  },
                }}
              >
                {followLoading ? (
                  <CircularProgress size={16} />
                ) : following ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </Button>
            ) : (
              <Chip
                label="Your Hub"
                size="small"
                sx={{ bgcolor: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem' }}
              />
            )}
          </Box>

          {/* Username & Handle */}
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', mb: 0.25, letterSpacing: '-0.5px' }}>
            {profile.username}
          </Typography>
          <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.9rem', mb: 1, fontWeight: 500 }}>
            @{profile.username?.toLowerCase()}
          </Typography>

          {/* Bio */}
          {profile.bio && (
            <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem', mb: 2, lineHeight: 1.6 }}>
              {profile.bio}
            </Typography>
          )}

          <Divider sx={{ borderColor: 'var(--border-color)', my: 2 }} />

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                {posts.length}
              </Typography>
              <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Posts</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                {profile.followers?.length || 0}
              </Typography>
              <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Followers</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                {profile.following?.length || 0}
              </Typography>
              <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Following</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ── Posts Section ──────────────────────── */}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: '#65676b', mb: 1.5, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        📝 Posts
      </Typography>

      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: '#8a8d91' }}>
          <Typography sx={{ fontSize: '2rem', mb: 1 }}>📭</Typography>
          <Typography sx={{ fontWeight: 600, color: '#65676b' }}>No posts yet</Typography>
        </Box>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
        ))
      )}
    </Box>
  );
};

export default ProfilePage;
