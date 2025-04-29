import { useInfiniteQuery } from '@tanstack/react-query';
import { Container, Divider, Typography, Grid, Box } from '@mui/material';
import Track from '../components/track';
import RecentTracks from '../components/userplays';
import RecentLikes from '../components/userlikes';
import api from '../services/api';
import Loader from '../components/loader';
import { useUser } from "../contexts/usercontext";
import { useEffect, useRef } from 'react';

export default function Feed() {
  const { user, userProfile } = useUser();
  const loaderRef = useRef(null);

  const fetchTracks = async ({ pageParam = 1 }) => {
    const response = await api.get('Track', {
      params: {
        pageNumber: pageParam,
        pageSize: 6,
      },
    });
    return response.data.data.tracks;
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
    queryKey: ['tracks'],
    queryFn: fetchTracks,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
    },
    initialPageParam: 1,
    refetchInterval: 300000,
  });

  const tracks = data?.pages.flatMap((page) => page.items) || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Container sx={{ mt: 12 }}>
      <Divider sx={{ borderColor: 'transparent' }} />

      <Typography variant="h5" sx={{ color: '#666' }}>
        olá,{' '}
        <Typography
          variant="inherit"
          sx={{ display: 'inline', color: 'primary.main' }}
        >
          {userProfile && userProfile?.displayName !== ""
            ? `${userProfile.displayName}`
            : `${user.username}`}
        </Typography>
        .
      </Typography>
      <Typography variant="h5" sx={{ color: '#666' }}>
        escute as jams mais recentes:
      </Typography>

      <Divider sx={{ mt: 3, borderColor: 'transparent' }} />

      <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tracks.map((track) => (
              <Track
                key={track.id}
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
              />
            ))}
          </Box>

          {isLoading && <Loader />}

          {hasNextPage && (
            <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Loader />
            </div>
          )}

          {isError && <div>Error: {error.message}</div>}
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, position: 'sticky', top: 16 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
              plays recentes
            </Typography>
            <RecentTracks userId={user.id} />
            <Divider sx={{ my: 2, borderColor: 'transparent' }} />
            <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
              curtidas recentes
            </Typography>
            <RecentLikes userId={user.id} />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ mt: 8, borderColor: 'transparent' }} />
    </Container>
  );
}