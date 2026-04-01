import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top left, #e4e6eb 0%, #f0f4f8 50%, #ffffff 100%)',
        px: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 32px rgba(29, 78, 216, 0.4)',
          }}
        >
          🌐
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to SocialHub
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: '#475569', mb: 5, fontWeight: 400, lineHeight: 1.6 }}
        >
          Connect with friends, share your moments, and explore what's happening around you.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
              boxShadow: '0 4px 15px rgba(29,78,216,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1e40af, #0284c7)',
                boxShadow: '0 6px 20px rgba(29,78,216,0.5)',
              },
            }}
          >
            Log In
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/register')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '9999px',
              borderColor: '#1d4ed8',
              borderWidth: '2px',
              color: '#1d4ed8',
              '&:hover': {
                borderWidth: '2px',
                borderColor: '#1e40af',
                bgcolor: 'rgba(29,78,216,0.05)',
              },
            }}
          >
            Create Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
