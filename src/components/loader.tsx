import { Box, Divider, LinearProgress } from "@mui/material";

const Loader = () => {
  return (
    <Box sx={{ width: '10%', margin: 'auto' }}>
      <Divider sx={{ my: 2, borderColor: 'transparent' }}></Divider>
      <LinearProgress color="secondary"/>
    </Box>
  );
};

export default Loader;
