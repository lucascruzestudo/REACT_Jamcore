import { Box, Skeleton } from '@mui/material';

const TrackSkeleton: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: '14px',
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}
  >
    {/* CSS Grid matching track.tsx responsive layout */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '90px 1fr', sm: '175px 1fr' },
        gridTemplateAreas: {
          xs: '"photo meta" "wave wave" "comm comm"',
          sm: '"photo meta" "photo wave" "photo comm"',
        },
        p: { xs: 1, sm: 2 },
        columnGap: { xs: 1.5, sm: 2 },
        rowGap: { xs: 1, sm: 1 },
        alignItems: 'start',
      }}
    >
      {/* Cover */}
      <Skeleton
        variant="rounded"
        sx={{
          gridArea: 'photo',
          width: { xs: 90, sm: 175 },
          height: { xs: 90, sm: 175 },
          borderRadius: '8px',
          flexShrink: 0,
        }}
      />

      {/* Meta: author + date, title + tag */}
      <Box sx={{ gridArea: 'meta', display: 'flex', flexDirection: 'column', gap: { xs: 0.25, sm: 0.35 }, justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={80} height={14} />
          <Skeleton variant="text" width={50} height={14} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="text" sx={{ flex: 1 }} height={20} />
          <Skeleton variant="rounded" width={52} height={18} sx={{ borderRadius: '4px', flexShrink: 0 }} />
        </Box>
      </Box>

      {/* Waveform */}
      <Box sx={{ gridArea: 'wave', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: '6px' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
            <Skeleton variant="text" width={28} height={12} />
            <Skeleton variant="text" width={28} height={12} />
          </Box>
        </Box>
      </Box>

      {/* Comment input */}
      <Skeleton
        variant="rounded"
        sx={{ gridArea: 'comm', width: '100%', height: { xs: 40, sm: 36 }, borderRadius: '24px' }}
      />
    </Box>

    {/* Divider */}
    <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', mx: 2 }} />

    {/* Bottom stats bar: actions left, counters right */}
    <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: '6px' }} />
        <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: '6px' }} />
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
