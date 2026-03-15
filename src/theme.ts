import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E93434',
      light: '#FF6B6B',
      dark: '#C62828',
    },
    secondary: {
      main: '#555555',
      light: '#888888',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
    },
    error: {
      main: '#D32F2F',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: 'Gabarito, Inter, Roboto, Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.85rem' },
    caption: { fontSize: '0.75rem', color: '#888' },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
    '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)',
    '0 6px 16px rgba(0,0,0,0.10)',
    '0 8px 20px rgba(0,0,0,0.12)',
    '0 10px 24px rgba(0,0,0,0.12)',
    '0 12px 28px rgba(0,0,0,0.14)',
    '0 14px 32px rgba(0,0,0,0.14)',
    '0 16px 36px rgba(0,0,0,0.16)',
    '0 18px 40px rgba(0,0,0,0.16)',
    '0 20px 44px rgba(0,0,0,0.18)',
    '0 22px 48px rgba(0,0,0,0.18)',
    '0 24px 52px rgba(0,0,0,0.20)',
    '0 26px 56px rgba(0,0,0,0.20)',
    '0 28px 60px rgba(0,0,0,0.22)',
    '0 30px 64px rgba(0,0,0,0.22)',
    '0 32px 68px rgba(0,0,0,0.24)',
    '0 34px 72px rgba(0,0,0,0.24)',
    '0 36px 76px rgba(0,0,0,0.26)',
    '0 38px 80px rgba(0,0,0,0.26)',
    '0 40px 84px rgba(0,0,0,0.28)',
    '0 42px 88px rgba(0,0,0,0.28)',
    '0 44px 92px rgba(0,0,0,0.30)',
    '0 46px 96px rgba(0,0,0,0.30)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          letterSpacing: '0.01em',
        },
        containedPrimary: {
          boxShadow: '0 2px 8px rgba(233,52,52,0.30)',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(233,52,52,0.40)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
