import { Box, Container, Grid, Skeleton } from '@mui/material';
import CompactTrackSkeleton from '../components/compacttrackskeleton';
import TrackSkeleton from '../components/trackskeleton';

const cardSx = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    overflow: 'hidden',
};

const cardHeaderSx = {
    px: { xs: 2, sm: 3 },
    py: 2,
    borderBottom: '1px solid rgba(0,0,0,0.06)',
};

const SidebarCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
    <Box sx={cardSx}>
        <Box sx={cardHeaderSx}>
            <Skeleton variant="text" width={130} height={14} />
        </Box>
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Array.from({ length: rows }).map((_, i) => (
                <CompactTrackSkeleton key={i} />
            ))}
        </Box>
    </Box>
);

const UserProfileSkeleton: React.FC = () => (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>

        {/* Header banner */}
        <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', pt: 10, pb: 4, px: { xs: 2, sm: 4 } }}>
            <Container maxWidth="lg">
                <Skeleton variant="text" width={60} height={14} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={240} height={44} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={300} height={22} />
            </Container>
        </Box>

        {/* Back button row */}
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, mt: 2 }}>
            <Box sx={{ py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="text" width={100} height={20} />
            </Box>
        </Container>

        <Container maxWidth="lg" sx={{ py: 2, px: { xs: 2, sm: 3 } }}>

            {/* Profile card */}
            <Box
                sx={{
                    ...cardSx,
                    p: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    alignItems: { xs: 'center', md: 'flex-start' },
                    mb: 3,
                    boxShadow: 'none',
                }}
            >
                {/* Avatar */}
                <Skeleton
                    variant="circular"
                    sx={{
                        flexShrink: 0,
                        width: { xs: 120, md: 160 },
                        height: { xs: 120, md: 160 },
                    }}
                />

                {/* Info */}
                <Box sx={{ flex: 1, width: '100%' }}>
                    <Skeleton variant="text" width={200} height={36} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width={100} height={20} sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <Skeleton variant="circular" width={16} height={16} />
                        <Skeleton variant="text" width={120} height={18} />
                    </Box>
                    <Skeleton variant="text" width="90%" height={18} />
                    <Skeleton variant="text" width="75%" height={18} />
                    <Skeleton variant="text" width="60%" height={18} sx={{ mb: 2 }} />
                    <Skeleton variant="rounded" width={110} height={32} sx={{ borderRadius: '8px' }} />
                </Box>
            </Box>

            {/* Grid */}
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

                {/* Jams (main) */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TrackSkeleton key={i} />
                        ))}
                    </Box>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: 'sticky', top: 80 }}>
                        <SidebarCard rows={3} />
                        <SidebarCard rows={3} />

                        {/* Comentários recentes */}
                        <Box sx={cardSx}>
                            <Box sx={cardHeaderSx}>
                                <Skeleton variant="text" width={160} height={14} />
                            </Box>
                            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Box key={i}>
                                        <Skeleton variant="text" width="80%" height={16} />
                                        <Skeleton variant="text" width="55%" height={13} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Grid>

            </Grid>

        </Container>
    </Box>
);

export default UserProfileSkeleton;
