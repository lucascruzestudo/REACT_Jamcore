import { Box, Container, Typography, IconButton, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DetailedTrack from '../components/detailedtrack';
import DetailedTrackSkeleton from '../components/detailedtrackskeleton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

const fetchTrack = async (trackId: string) => {
    const response = await api.get(`Track/${trackId}`);
    return response.data.data.track;
};

export default function TrackPage() {
    const { trackid } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: track, isLoading, isError, error } = useQuery({
        queryKey: ['track', trackid],
        queryFn: () => fetchTrack(trackid || ''),
        enabled: !!trackid,
    });

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
            <Container maxWidth="md" sx={{ pt: 10, pb: 4, px: { xs: 2, sm: 3 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate('/feed')}
                                                sx={{ color: '#777', '&:hover': { color: '#111' } }}
                                            >
                                                <ArrowBackIcon fontSize="small" />
                                            </IconButton>
                                            <Button size="small" variant="text" onClick={() => navigate('/feed')} sx={{ color: '#777', textTransform: 'none' }}>
                                                voltar ao feed
                                            </Button>
                                        </Box>

                    {isLoading && <DetailedTrackSkeleton />}

                    {isError && (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <Typography variant="body1" color="error">
                                {error instanceof Error ? error.message : 'Erro desconhecido'}
                            </Typography>
                        </Box>
                    )}

                    {!isLoading && !isError && track && (
                        <DetailedTrack
                            key={track.id}
                            id={track.id}
                            title={track.title}
                            tags={track.tags}
                            audioFileUrl={track.audioFileUrl}
                            imageUrl={track.imageUrl}
                            userId={track.userId}
                            username={track.username}
                            createdAt={track.createdAt}
                            likeCount={track.likeCount}
                            playCount={track.playCount}
                            userLikedTrack={track.userLikedTrack}
                            originalDuration={track.duration}
                            description={track.description}
                            comments={track.comments}
                            updatedAt={track.updatedAt}
                            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['track', trackid] })}
                        />
                    )}
                </motion.div>
            </Container>
        </Box>
    );
}