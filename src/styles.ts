import { SxProps, Theme } from '@mui/system';

interface Styles {
  root: SxProps<Theme>;
  logo: SxProps<Theme>;
  form: SxProps<Theme>;
  textField: SxProps<Theme>;
  button: SxProps<Theme>;
  helperText: SxProps<Theme>;
  card: SxProps<Theme>;
}

const styles: Styles = {
  root: {
    backgroundColor: '#FAFAFA',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '40px 36px',
    width: '90%',
    maxWidth: '420px',
  },
  logo: {
    marginBottom: 32,
    width: '45%',
    maxWidth: '160px',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  textField: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#FAFAFA',
      fontSize: '0.95rem',
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.9rem',
    },
  },
  button: {
    marginTop: 2,
    padding: '12px 0',
    backgroundColor: '#E93434',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 600,
    width: '100%',
    borderRadius: '8px',
  },
  helperText: {
    color: '#888888',
    fontSize: '0.8rem',
    marginTop: '2px',
  },
};

export default styles;
