import React from 'react';
import { Box, Paper, Avatar, Typography, Divider, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSidecard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        bgcolor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'sticky',
        top: 86,
      }}
    >
      {/* Cover placeholder */}
      <Box
        sx={{
          height: 60,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
        }}
      />
      
      <Box sx={{ px: 2, pb: 2, mt: -4, textAlign: 'center' }}>
        <Avatar
          src={user.avatar}
          sx={{
            width: 64,
            height: 64,
            border: '4px solid #ffffff',
            bgcolor: '#1d4ed8',
            mx: 'auto',
            mb: 1,
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          {user.username?.[0]?.toUpperCase()}
        </Avatar>
        
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}
        >
          {user.username}
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--text-muted)', mb: 2, display: 'block' }}>
          @{user.username?.toLowerCase()}
        </Typography>

        <Divider sx={{ my: 2, borderColor: 'var(--border-color)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              {user.followers?.length || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Followers
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              {user.following?.length || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Following
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          size="small"
          onClick={() => navigate(`/profile/${user.username}`)}
          sx={{
            borderRadius: '999px',
            textTransform: 'none',
            fontWeight: 700,
            color: 'var(--brand-blue)',
            borderColor: 'var(--border-color)',
            '&:hover': {
              borderColor: 'var(--brand-blue)',
              bgcolor: 'var(--bg-card-hover)',
            },
          }}
        >
          My Profile
        </Button>
      </Box>
    </Paper>
  );
};

export default ProfileSidecard;
