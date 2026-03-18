import { Box, Skeleton, Divider } from '@mui/material';

const CompactTrackSkeleton: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1,
      borderRadius: '10px',
      backgroundColor: '#fff',
      border: '1px solid rgba(0,0,0,0.06)',
    }}
  >
    {/* Cover thumbnail */}
    <Skeleton variant="rounded" width={44} height={44} sx={{ flexShrink: 0, borderRadius: '7px' }} />

    <Divider orientation="vertical" flexItem />

    {/* Title / username */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Skeleton variant="text" width={60} height={13} sx={{ mb: 0.25 }} />
      <Skeleton variant="text" width={110} height={16} />
    </Box>

    {/* Counts */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
      <Skeleton variant="rounded" width={42} height={22} sx={{ borderRadius: '5px' }} />
      <Skeleton variant="rounded" width={42} height={22} sx={{ borderRadius: '5px' }} />
    </Box>
  </Box>
);

export default CompactTrackSkeleton;
