import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingScreen
 * Full-page spinner shown while auth state is being restored.
 */
const LoadingScreen = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #1877f2, #4294ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        mb: 1,
        boxShadow: '0 8px 32px rgba(79,70,229,0.4)',
      }}
    >
      🌐
    </Box>
    <CircularProgress size={36} sx={{ color: '#1877f2' }} />
    <Typography sx={{ color: '#65676b', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
      Loading Social...
    </Typography>
  </Box>
);

export default LoadingScreen;
