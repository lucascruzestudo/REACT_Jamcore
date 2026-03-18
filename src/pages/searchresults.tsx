import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Container, Typography, Grid, Box, IconButton, Button, Chip,
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Track from '../components/track';
import TrackSkeleton from '../components/trackskeleton';
import Loader from '../components/loader';
import api from '../services/api';
import type { Track as TrackItem } from '../contexts/trackcontext';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loaderRef = useRef(null);
  const query = searchParams.get('q') ?? '';

  const fetchSearch = async ({ pageParam = 1 }) => {
    const response = await api.get('Track/search', {
      params: { q: query, pageNumber: pageParam, pageSize: 6 },
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
    queryKey: ['searchTracks', query],
    queryFn: fetchSearch,
    getNextPageParam: (lastPage) =>
      lastPage.tracks.hasNextPage ? lastPage.tracks.pageNumber + 1 : undefined,
    initialPageParam: 1,
    enabled: query.trim().length > 0,
  });

  const tracks = data?.pages.flatMap((page) => page.tracks.items) ?? [];
  const totalCount = data?.pages?.[0]?.tracks?.totalCount ?? 0;

  const playlistTracks: TrackItem[] = tracks.map((t: any) => ({
    ...t,
    originalDuration: t.duration ?? t.originalDuration ?? '',
  }));

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
      {/* Header banner */}
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
            <Typography
              variant="body2"
              sx={{ color: '#aaa', mb: 0.5, letterSpacing: '0.05em', fontSize: '0.72rem' }}
            >
              resultado da pesquisa
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                resultados para&nbsp;
                <Box component="span" sx={{ color: 'primary.main' }}>
                  &ldquo;{query}&rdquo;
                </Box>
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#777', mt: 0.5 }}>
              {isLoading
                ? 'buscando jams...'
                : totalCount > 0
                ? `${totalCount} jam${totalCount !== 1 ? 's' : ''} encontrada${totalCount !== 1 ? 's' : ''} para este termo.`
                : 'nenhuma jam encontrada para este termo.'}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Back button */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, mt: 2 }}>
        <Box sx={{ py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => navigate('/feed')}
            sx={{ color: '#777', '&:hover': { color: '#111' } }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            variant="text"
            onClick={() => navigate('/feed')}
            sx={{ color: '#777', textTransform: 'none' }}
          >
            voltar ao feed
          </Button>
        </Box>
      </Container>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={4}>
          {/* Track list */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <TrackSkeleton key={i} />)
              ) : tracks.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 10,
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <MusicNoteIcon sx={{ fontSize: 48, color: '#ddd', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#bbb', fontWeight: 600 }}>
                    nenhuma jam encontrada
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc', mt: 0.5 }}>
                    tente outro termo de pesquisa.
                  </Typography>
                </Box>
              ) : (
                tracks.map((track: any, i: number) => (
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
                      playlist={playlistTracks}
                      playlistIndex={i}
                    />
                  </motion.div>
                ))
              )}
            </Box>

            {hasNextPage && (
              <div
                ref={loaderRef}
                style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}
              >
                <Loader />
              </div>
            )}

            {isError && (
              <Typography
                variant="body2"
                sx={{ color: 'error.main', mt: 2, textAlign: 'center' }}
              >
                erro ao buscar: {(error as any).message}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SearchIcon sx={{ fontSize: 18, color: '#E93434' }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.72rem',
                  }}
                >
                  pesquisa atual
                </Typography>
              </Box>

              <Chip
                label={`"${query}"`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(233,52,52,0.08)',
                  color: '#E93434',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  mb: 2,
                  maxWidth: '100%',
                }}
              />

              <Typography variant="body2" sx={{ color: '#888', fontSize: '0.82rem', lineHeight: 1.6 }}>
                a pesquisa abrange <strong>título</strong>, <strong>descrição</strong>,{' '}
                <strong>nome do artista</strong> e <strong>tags</strong> das jams públicas.
              </Typography>

              {!isLoading && totalCount > 0 && (
                <>
                  <Box sx={{ my: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '0.72rem',
                      mb: 1,
                    }}
                  >
                    estatísticas
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#888', fontSize: '0.82rem' }}>
                      jams encontradas
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#111', fontWeight: 700, fontSize: '0.82rem' }}>
                      {totalCount}
                    </Typography>
                  </Box>
                </>
              )}


            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
