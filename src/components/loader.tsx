import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface LoaderProps {
  centered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BAR_DELAYS = [0, 0.15, 0.3, 0.45];
const BAR_BASE_HEIGHTS = [18, 30, 22, 28];

const Loader = ({ centered, size = 'md' }: LoaderProps) => {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        mt: centered ? 0 : 4,
        position: centered ? 'fixed' : 'static',
        top: centered ? '50%' : 'auto',
        left: centered ? '50%' : 'auto',
        transform: centered ? 'translate(-50%, -50%)' : 'none',
        zIndex: centered ? 9999 : 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: 40 * scale }}>
        {BAR_DELAYS.map((delay, i) => (
          <motion.div
            key={i}
            style={{
              width: 5 * scale,
              borderRadius: 99,
              backgroundColor: '#E93434',
              originY: 1,
            }}
            animate={{
              scaleY: [0.25, 1, 0.25],
              height: BAR_BASE_HEIGHTS[i] * scale,
            }}
            transition={{
              scaleY: {
                duration: 0.75,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Loader;