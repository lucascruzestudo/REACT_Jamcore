import { Box } from "@mui/material";

const Loader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', mt: 4 }}>
    <img src="/public/loader.gif" alt="Loading..." style={{ width: '2%' }} />
  </Box>
);

export default Loader;
