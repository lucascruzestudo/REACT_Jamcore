import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Container, Typography, Grid, Box } from '@mui/material';
import Track from '../components/track';
import RecentTracks from '../components/userplays';
import RecentLikes from '../components/userlikes';
import api from '../services/api';
import Loader from '../components/loader';
import { useUser } from '../contexts/usercontext';
import { useEffect, useRef } from 'react';
import { useTrackInteractionContext } from '../contexts/trackinteractioncontext';
import { motion } from 'framer-motion';

export default function Feed() {
  const { user, userProfile } = useUser();
  const queryClient = useQueryClient();
  const { interactionVersion } = useTrackInteractionContext();
  const loaderRef = useRef(null);

  const fetchFeed = async ({ pageParam = 1 }) => {
    const response = await api.get('Track/feed', {
      params: { pageNumber: pageParam, pageSize: 6 },
    });
    return response.data.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    getNextPageParam: (lastPage) =>
      lastPage.tracks.hasNextPage ? lastPage.tracks.pageNumber + 1 : undefined,
    initialPageParam: 1,
    refetchInterval: 300000,
  });

  const tracks = data?.pages.flatMap((page) => page.tracks.items) || [];
  const latestPage = data?.pages[data.pages.length - 1];
  const recentPlays = latestPage?.recentPlays ?? [];
  const recentLikes = latestPage?.recentLikes ?? [];

  const displayName = userProfile?.displayName
    ? userProfile.displayName
    : user?.username || '';

  useEffect(() => {
    if (interactionVersion > 0) {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  }, [interactionVersion, queryClient]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Greeting banner */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          pt: 10,
          pb: 4,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Typography variant="body2" sx={{ color: '#aaa', mb: 0.5, letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              bem-vindo de volta
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
              olá,&nbsp;
              <Box component="span" sx={{ color: 'primary.main' }}>
                {displayName?.toLowerCase()}
              </Box>
              &nbsp;👋
            </Typography>
            <Typography variant="body1" sx={{ color: '#777', mt: 0.5 }}>
              escute as jams mais recentes da comunidade.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
          {/* Track feed */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {tracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i < 3 ? i * 0.06 : 0 }}
                >
                  <Track
                    id={track.id}
                    imageUrl={track.imageUrl}
                    title={track.title}
                    audioFileUrl={track.audioFileUrl}
                    playCount={track.playCount}
                    username={track.username}
                    userId={track.userId}
                    tags={track.tags}
                    likeCount={track.likeCount}
                    createdAt={track.createdAt}
                    userLikedTrack={track.userLikedTrack}
                    originalDuration={track.duration}
                    updatedAt={track.updatedAt}
                    commentCount={track.commentCount ?? 0}
                  />
                </motion.div>
              ))}
            </Box>

            {isLoading && <Loader />}

            {hasNextPage && (
              <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Loader />
              </div>
            )}

            {isError && (
              <Typography variant="body2" sx={{ color: 'error.main', mt: 2, textAlign: 'center' }}>
                erro ao carregar: {error.message}
              </Typography>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.06)',
                p: 2.5,
                position: 'sticky',
                top: 80,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                plays recentes
              </Typography>
              <RecentTracks tracks={recentPlays} />

              <Box sx={{ my: 2.5, borderTop: '1px solid rgba(0,0,0,0.06)' }} />

              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                curtidas recentes
              </Typography>
              <RecentLikes tracks={recentLikes} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

