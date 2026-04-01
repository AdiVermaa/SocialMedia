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
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * RegisterPage — full-page signup screen.
 * Collects username, email, and password.
 */
const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;
    if (!username || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data);
      toast.success(`Account created! Welcome, ${res.data.username} 🎉`);
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'radial-gradient(ellipse at top right, #e4e6eb 0%, #f0f2f5 50%, #ffffff 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: 'fixed', top: -100, right: -100, width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'fixed', bottom: -100, left: -100, width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
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
              background: 'linear-gradient(135deg, #4294ff, #1877f2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
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
            Join SocialHub
          </Typography>
          <Typography sx={{ color: '#65676b', fontSize: '0.875rem' }}>
            Create your account and start sharing
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            inputProps={{ minLength: 3, maxLength: 20 }}
            helperText="3–20 characters, no spaces"
            FormHelperTextProps={{ sx: { color: '#8a8d91', fontSize: '0.75rem' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#8a8d91', fontSize: '1.1rem' }} />
                </InputAdornment>
              ),
            }}
          />
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
            inputProps={{ minLength: 6 }}
            helperText="At least 6 characters"
            FormHelperTextProps={{ sx: { color: '#8a8d91', fontSize: '0.75rem' } }}
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
              background: 'linear-gradient(135deg, #4294ff, #1877f2)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                boxShadow: '0 6px 20px rgba(29,78,216,0.3)',
              },
              '&:disabled': { background: '#e4e6eb', color: '#8a8d91' },
              transition: 'all 0.25s',
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>
        </Box>

        {/* Login link */}
        <Typography sx={{ textAlign: 'center', mt: 3, color: '#65676b', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link
            onClick={() => navigate('/login')}
            sx={{ color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#1e40af' } }}
          >
            Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
