import { Box } from "@mui/material";

interface LoaderProps {
  centered?: boolean;
}

const Loader = ({ centered }: LoaderProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      mt: centered ? 0 : 4,
      position: centered ? 'fixed' : 'static',
      top: centered ? '50%' : 'auto',
      left: centered ? '50%' : 'auto',
      transform: centered ? 'translate(-50%, -50%)' : 'none',
    }}
  >
    <img
      src="/loader.gif"
      alt="carregando..."
      style={{
        width: centered ? '3%' : '5%',
      }}
    />
  </Box>
);

export default Loader;