import { useInfiniteQuery } from '@tanstack/react-query';
import { Container, Divider, Typography } from '@mui/material';
import Track from '../components/track';
import api from '../services/api';
import Loader from '../components/loader';
import { useUser } from "../contexts/usercontext";

export default function Feed() {
  const { user } = useUser();
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

  return (
    <Container>
      <Divider sx={{ marginTop: 1, borderColor: 'transparent' }} />

      <Typography variant="h5" sx={{ color: '#666' }}>
        olá @{user.username},
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

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Carregando mais...' : 'Carregar mais'}
        </button>
      )}

      {isError && <div>Error: {error.message}</div>}
    </Container>
  );
}