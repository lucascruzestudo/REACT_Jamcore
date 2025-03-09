import { SxProps, Theme } from '@mui/system';

interface Styles {
  root: SxProps<Theme>;
  logo: SxProps<Theme>;
  form: SxProps<Theme>;
  textField: SxProps<Theme>;
  button: SxProps<Theme>;
  helperText: SxProps<Theme>;
}

const styles: Styles = {
  root: {
    backgroundColor: 'white',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    textAlign: 'center',
  },
  logo: {
    marginBottom: 24,
    width: '50%',
    maxWidth: '200px',
  },
  form: {
    width: '90%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  textField: {
    marginBottom: 2,
    width: '100%',
  },
  button: {
    marginTop: 3,
    padding: '12px 0',
    backgroundColor: '#E93434',
    color: 'white',
    fontSize: '1rem',
    width: '100%',
  },
  helperText: {
    color: '#666666',
    marginTop: '4px',
  }
};


export default styles;
