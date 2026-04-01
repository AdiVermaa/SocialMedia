import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useAppTheme } from './context/ThemeContext';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';

// Components
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

// ──────────────────────────────────────────────
// App Content with dynamic theme
// ──────────────────────────────────────────────
const AppContent = () => {
  const { mode } = useAppTheme();

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb' },
      secondary: { main: '#0ea5e9' },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '9999px',
            padding: '8px 22px',
            transition: 'all 0.25s ease',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 25px rgba(37,99,235,0.2)' },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          }
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'var(--bg-input)',
              '& fieldset': { borderColor: 'var(--border-color)' },
              '&:hover fieldset': { borderColor: 'var(--brand-blue)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--brand-blue)' },
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Routes>
            <Route
              path="/"
              element={<PublicRoute><LandingPage /></PublicRoute>}
            />
            <Route
              path="/login"
              element={<PublicRoute><LoginPage /></PublicRoute>}
            />
            <Route
              path="/register"
              element={<PublicRoute><RegisterPage /></PublicRoute>}
            />
            <Route
              path="/feed"
              element={<PrivateRoute><FeedPage /></PrivateRoute>}
            />
            <Route
              path="/profile/:username"
              element={<PrivateRoute><ProfilePage /></PrivateRoute>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

// ──────────────────────────────────────────────
// Route guard for protected pages
// ──────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/feed" replace />;
};

// ──────────────────────────────────────────────
// App Component
// ──────────────────────────────────────────────
function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <AppContent />;
}

export default App;
