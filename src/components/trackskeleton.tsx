import { Box, Skeleton } from '@mui/material';

const TrackSkeleton: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      maxWidth: { xs: 600, sm: 700 },
      width: { xs: '100%', sm: 700 },
      m: 'auto',
      backgroundColor: '#fff',
      borderRadius: '14px',
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}
  >
    {/* Main content row */}
    <Box sx={{ display: 'flex', p: 2, gap: 2, alignItems: 'flex-start' }}>
      {/* Cover */}
      <Skeleton variant="rounded" width={120} height={120} sx={{ flexShrink: 0, borderRadius: '8px' }} />

      {/* Right content */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Top row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
            <Skeleton variant="text" width={80} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={160} height={20} />
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Skeleton variant="text" width={64} height={14} />
            <Skeleton variant="rounded" width={64} height={20} sx={{ mt: 0.5, borderRadius: '6px' }} />
          </Box>
        </Box>

        {/* Waveform row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: '6px' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
              <Skeleton variant="text" width={28} height={12} />
              <Skeleton variant="text" width={28} height={12} />
            </Box>
          </Box>
        </Box>

        {/* Comment input placeholder */}
        <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: '24px' }} />
      </Box>
    </Box>

    {/* Divider */}
    <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', mx: 2 }} />

    {/* Bottom stats bar: action left, counters right */}
    <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: '6px' }} />
      </Box>

      <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: '6px' }} />
        <Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: '6px' }} />
        <Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: '6px' }} />
      </Box>
    </Box>
  </Box>
);

export default TrackSkeleton;
