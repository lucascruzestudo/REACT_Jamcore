import { useInfiniteQuery } from '@tanstack/react-query';
import { Container, Divider, Typography } from '@mui/material';
import Track from '../components/track';
import api from '../services/api';
import Loader from '../components/loader';
import { useUser } from "../contexts/usercontext";
import { useEffect, useRef } from 'react';

export default function Feed() {
  const { user, userProfile } = useUser();
  const loaderRef = useRef(null); // Ref for the loader element

  const fetchTracks = async ({ pageParam = 1 }) => {
    const response = await api.get('Track', {
      params: {
        pageNumber: pageParam,
        pageSize: 10,
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

  // Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 } // Trigger when the loader is fully visible
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
    <Container>
      <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />

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

      <Divider sx={{ marginTop: 3, borderColor: 'transparent' }} />

      <Container sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tracks.map((track) => (
          <Track
            key={track.id}
            id={track.id}
            imageUrl={track.imageUrl}
            title={track.title}
            audioFileUrl={track.audioFileUrl}
            playCount={track.playCount}
            username={track.username}
            tags={track.tags}
            likeCount={track.likeCount}
            createdAt={track.createdAt}
            userLikedTrack={track.userLikedTrack}
            originalDuration={track.duration}
          />
        ))}
      </Container>

      {isLoading && <Loader />}

      {/* Loader at the bottom for infinite scroll */}
      {hasNextPage && (
        <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Loader />
        </div>
      )}

      {isError && <div>Error: {error.message}</div>}

      <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
    </Container>
  );
}