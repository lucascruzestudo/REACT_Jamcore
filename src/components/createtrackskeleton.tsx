import { Box, Container, Skeleton, Typography } from "@mui/material";

const CreateTrackSkeleton: React.FC = () => (
    <Container maxWidth="md" sx={{ minHeight: "100vh", pb: 8 }}>
        {/* Header */}
        <Box sx={{ pt: 11, pb: 3 }}>
            <Typography variant="h5" fontWeight={700} color="#111">
                criar jam
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
                faça upload do seu áudio e personalize as informações.
            </Typography>
        </Box>

        {/* Audio area (full width) */}
        <Box sx={{ mb: 2 }}>
            <Box sx={{ px: { xs: 0, sm: 0 } }}>
                <Box
                    sx={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(0,0,0,0.06)',
                        borderRadius: '10px',
                        px: 2,
                        py: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />

                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={16} sx={{ mb: 0.5 }} />
                            <Skeleton variant="rounded" width="100%" height={68} sx={{ borderRadius: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Skeleton variant="text" width={40} height={14} />
                                <Skeleton variant="text" width={40} height={14} />
                            </Box>
                        </Box>

                        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 6 }} />
                    </Box>
                </Box>
            </Box>
        </Box>

        {/* Cover + fields */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'flex-start' }}>
            <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 160 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton variant="text" width={100} height={14} />
                <Skeleton variant="rounded" width="100%" sx={{ aspectRatio: '1 / 1', borderRadius: '12px' }} />
            </Box>

            <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: '10px' }} />
                <Skeleton variant="rounded" width="100%" height={112} sx={{ borderRadius: '10px' }} />
                <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: '10px' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="rounded" width={34} height={20} sx={{ borderRadius: '10px' }} />
                    <Skeleton variant="text" width={50} height={16} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Skeleton variant="rounded" width={140} height={44} sx={{ borderRadius: '10px' }} />
                </Box>
            </Box>
        </Box>
    </Container>
);

export default CreateTrackSkeleton;
