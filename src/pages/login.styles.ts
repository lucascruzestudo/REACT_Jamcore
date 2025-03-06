import { SxProps, Theme } from '@mui/system';

interface Styles {
  root: SxProps<Theme>;
  logo: SxProps<Theme>;
  form: SxProps<Theme>;
  textField: SxProps<Theme>;
  button: SxProps<Theme>;
  errorText: SxProps<Theme>;
  helperText: SxProps<Theme>;
}

const styles: Styles = {
  root: {
    backgroundColor: 'white',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  logo: {
    marginBottom: 24,
    width: '200px',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
  },
  textField: {
    marginBottom: 2,
  },
  button: {
    marginTop: 4,
    backgroundColor: '#E93434',
    color: 'white',
  },
  errorText: {
    color: '#E93434',
  },
  helperText: {
    color: 'blue',
    marginTop: '4px',
  },
};

export default styles;
