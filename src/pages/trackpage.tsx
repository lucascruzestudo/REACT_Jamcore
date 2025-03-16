import { Box, Container, Divider, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DetailedTrack from '../components/detailedtrack';
import Loader from '../components/loader';


const fetchTrack = async (trackId: string) => {
    const response = await api.get(`Track/${trackId}`);
    return response.data.data.track;
};

export default function TrackPage() {
    const { trackid } = useParams();

    const { data: track, isLoading, isError, error } = useQuery(
        {
            queryKey: ['track', trackid],
            queryFn: () => fetchTrack(trackid || ''),
            enabled: !!trackid
        }
      );
      
    if (isLoading) {
        return (
            <Container>
                <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
                <Box sx={{ textAlign: 'center' }}>
                    <Loader centered></Loader>
                </Box>
                <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
            </Container>
        );
    }

    if (isError) {
        return (
            <Container>
                <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h1">Erro: {error instanceof Error ? error.message : 'Erro desconhecido'}</Typography>
                </Box>
                <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
            </Container>
        );
    }

    return (
        <Container>
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
            {track && (
                <DetailedTrack
                    key={track.id}
                    id={track.id}
                    title={track.title}
                    tags={track.tags}
                    audioFileUrl={track.audioFileUrl}
                    imageUrl={track.imageUrl}
                    username={track.username}
                    createdAt={track.createdAt}
                    likeCount={track.likeCount}
                    playCount={track.playCount}
                    userLikedTrack={track.userLikedTrack}
                    originalDuration={track.duration}
                    description={track.description}
                    comments={track.comments}
                />
            )}
            <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
        </Container>
    );
}
