import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Image as ImageIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { createPost } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * CreatePost
 * Post composer component — supports text and/or image upload.
 * At least one of them is required. Mirrors the TaskPlanet "What's on your mind?" input.
 */
const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);      // File object
  const [preview, setPreview] = useState('');    // Data URL for preview
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle image file selection and create preview
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) {
      toast.error('Add some text or an image to post');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (image) formData.append('image', image);

      const res = await createPost(formData);
      toast.success('Post shared! 🎉');
      setText('');
      removeImage();
      onPostCreated(res.data); // Immediately prepend to feed
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        bgcolor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 2, fontSize: '0.95rem' }}
      >
        ✍️ Create Post
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Text Area */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            src={user?.avatar}
            sx={{
              width: 42,
              height: 42,
              bgcolor: 'var(--brand-blue)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
            inputProps={{ maxLength: 2000 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--bg-input)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                '& fieldset': { borderColor: 'var(--border-color)' },
                '&:hover fieldset': { borderColor: 'var(--brand-blue)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--brand-blue)' },
              },
              '& .MuiInputBase-input::placeholder': { color: 'var(--text-muted)' },
            }}
          />
        </Box>

        {/* Image Preview */}
        {preview && (
          <Box sx={{ position: 'relative', mb: 2, borderRadius: '12px', overflow: 'hidden' }}>
            <img
              src={preview}
              alt="preview"
              style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}
            />
            <IconButton
              size="small"
              onClick={removeImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                '&:hover': { bgcolor: '#f02849' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Action Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Image Upload Button */}
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
              id="post-image-input"
            />
            <Tooltip title="Add Image">
              <IconButton
                component="label"
                htmlFor="post-image-input"
                sx={{
                  color: preview ? 'var(--brand-blue)' : 'var(--text-muted)',
                  borderRadius: '10px',
                  '&:hover': { bgcolor: 'var(--bg-card-hover)', color: 'var(--brand-blue)' },
                  transition: 'all 0.2s',
                }}
              >
                <ImageIcon />
              </IconButton>
            </Tooltip>
            {image && (
              <Typography
                component="span"
                sx={{ fontSize: '0.75rem', color: '#65676b', ml: 0.5 }}
              >
                {image.name.length > 20 ? image.name.slice(0, 20) + '...' : image.name}
              </Typography>
            )}
          </Box>

          {/* Post Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (!text.trim() && !image)}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{
              bgcolor: 'var(--brand-blue)',
              color: '#ffffff !important',
              px: 3,
              py: 1,
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.85rem',
              '&:hover': { bgcolor: 'var(--brand-blue-hover)' },
              '&:disabled': { bgcolor: 'var(--bg-input)', color: 'var(--text-muted)' },
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;
