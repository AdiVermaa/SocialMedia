import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  DarkModeOutlined as DarkModeIcon,
  LightModeOutlined as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

/**
 * Navbar — top navigation bar.
 * Shows logo, app name, and user menu (avatar → profile / logout).
 * Hidden on /login and /register (those are full-page).
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate(`/profile/${user.username}`);
  };

  if (!user) return null; // Don't show navbar on auth pages

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ maxWidth: 680, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 } }}>
        {/* Logo + App Name */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, cursor: 'pointer' }}
          onClick={() => (window.location.href = '/feed')}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1877f2, #4294ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
            }}
          >
            🌐
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.25rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.8px',
            }}
          >
            SocialHub
          </Typography>
        </Box>

        {/* Theme Toggle + User chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': { bgcolor: 'var(--bg-card-hover)', color: 'var(--brand-blue)' },
            }}
          >
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
          
          <Chip
            avatar={
              <Avatar
                src={user.avatar?.startsWith('/uploads') ? `${process.env.REACT_APP_SERVER_URL}${user.avatar}` : user.avatar}
                sx={{ bgcolor: 'var(--brand-blue)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800 }}
              >
                {user.username?.[0]?.toUpperCase()}
              </Avatar>
            }
            label={`@${user.username}`}
            onClick={handleMenuOpen}
            sx={{
              bgcolor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: 'var(--bg-card-hover)', borderColor: 'var(--brand-blue)' },
              transition: 'all 0.2s',
            }}
          />
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              bgcolor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              minWidth: 180,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile} sx={{ color: 'var(--text-primary)', gap: 1.5 }}>
            <AccountCircleIcon fontSize="small" sx={{ color: '#1877f2' }} />
            My Profile
          </MenuItem>
          <Divider sx={{ borderColor: '#e4e6eb', my: 0.5 }} />
          <MenuItem onClick={handleLogout} sx={{ color: '#f02849', gap: 1.5 }}>
            <LogoutIcon fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
