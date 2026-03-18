import { Box, Skeleton } from '@mui/material';

const DetailedTrackSkeleton: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: '16px',
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}
  >
    {/* Banner: two-column */}
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch', gap: { xs: 1.5, sm: 2 } }}>

      {/* Left: play + [title | date+tags] + waveform */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top row: play + info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 1.5 }, flex: 1 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ flexShrink: 0 }} />

          {/* info: title (left) | date+tag (right) */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mt: 0.25 }}>
            <Box sx={{ minWidth: 0 }}>
              <Skeleton variant="text" width={60} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={140} height={28} />
            </Box>
            <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Skeleton variant="text" width={80} height={14} />
              <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: '20px' }} />
            </Box>
          </Box>
        </Box>

        {/* Waveform */}
        <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
          <Skeleton variant="rounded" width="100%" height={100} sx={{ borderRadius: '6px' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 0.5, sm: 1.5 }, pb: 1.5 }}>
            <Skeleton variant="text" width={28} height={12} />
            <Skeleton variant="text" width={28} height={12} />
          </Box>
        </Box>
      </Box>

      {/* Right: square cover only (desktop column, mobile full-width) */}
      <Skeleton
        variant="rounded"
        sx={{ flexShrink: 0, width: { xs: '100%', sm: 225 }, alignSelf: 'stretch', height: { xs: 'auto', sm: 225 }, borderRadius: '8px', mb: 1 }}
      />
    </Box>

    {/* Actions bar */}
    <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 1.5, sm: 2 }, py: 0.75, borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: '6px' }} />
        <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: '6px' }} />
      </Box>
      <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: '6px' }} />
        <Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: '6px' }} />
        <Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: '6px' }} />
      </Box>
    </Box>

    {/* Description placeholder */}
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <Skeleton variant="text" width="80%" height={16} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="55%" height={16} />
    </Box>

    {/* Comments section */}
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
      <Skeleton variant="text" width={110} height={14} sx={{ mb: 2 }} />
      {/* Comment input */}
      <Skeleton variant="rounded" width="100%" height={42} sx={{ borderRadius: '24px', mb: 3 }} />
      {/* Comment rows */}
      {[1, 2].map((i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={100} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={14} />
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

export default DetailedTrackSkeleton;
