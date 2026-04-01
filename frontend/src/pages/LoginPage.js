import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * LoginPage — full-page dark auth screen.
 * Inspired by modern SaaS login flows with gradient branding.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.username}! 👋`);
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'radial-gradient(ellipse at top left, #e4e6eb 0%, #f0f2f5 50%, #ffffff 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: 'fixed', top: -100, left: -100, width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'fixed', bottom: -100, right: -100, width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: '#ffffff',
          border: '1px solid #e4e6eb',
          borderRadius: '24px',
          p: { xs: 3, sm: 4 },
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #1877f2, #4294ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 32px rgba(79,70,229,0.4)',
            }}
          >
            🌐
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Welcome back
          </Typography>
          <Typography sx={{ color: '#65676b', fontSize: '0.875rem' }}>
            Sign in to SocialHub
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#8a8d91', fontSize: '1.1rem' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#8a8d91', fontSize: '1.1rem' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                    {showPassword ? (
                      <VisibilityOff sx={{ color: '#8a8d91' }} />
                    ) : (
                      <Visibility sx={{ color: '#8a8d91' }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1877f2, #4294ff)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(79,70,229,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                boxShadow: '0 6px 20px rgba(29,78,216,0.3)',
              },
              '&:disabled': { background: '#e4e6eb', color: '#8a8d91' },
              transition: 'all 0.25s',
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>

        {/* Register link */}
        <Typography sx={{ textAlign: 'center', mt: 3, color: '#65676b', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link
            onClick={() => navigate('/register')}
            sx={{ color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#1e40af' } }}
          >
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
