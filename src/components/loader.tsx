import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";

const Loader = () => {
  const delayBetweenCycles = 1;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="body1" sx={{ display: "flex", alignItems: "center", color: "secondary.main" }}>
        {[".", ".", "."].map((dot, index) => (
          <motion.span
            key={index}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: delayBetweenCycles,
              delay: index * 0.2,
            }}
            style={{ marginLeft: 2 }}
          >
            {dot}
          </motion.span>
        ))}
      </Typography>
    </Box>
  );
};

export default Loader;
