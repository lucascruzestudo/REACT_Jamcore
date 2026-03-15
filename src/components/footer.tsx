import React, { useRef } from 'react';
import { Box, Typography, Slider, Avatar, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useTrack } from '../contexts/trackcontext';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeMute,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { useTrackInteraction } from '../hooks/usetrackinteraction';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PLAYER_HEIGHT_DESKTOP = 68;
const PLAYER_HEIGHT_MOBILE = 96;

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    updateTime,
    setIsPlaying,
    setVolume,
    volume,
  } = useTrack();

  const { userLiked, toggleLike } = useTrackInteraction({
    trackId: currentTrack?.id || '',
    initialLikeCount: currentTrack?.likeCount || 0,
    initialPlayCount: (currentTrack as any)?.playCount || 0,
    initialUserLiked: (currentTrack as any)?.userLikedTrack || false,
  });

  const volumeRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    if (currentTrack) togglePlayPause(currentTrack);
  };

  const handleTimeChange = (_: Event, val: number | number[]) => {
    if (typeof val === 'number') updateTime(val);
  };

  const handleVolumeChange = (_: Event, val: number | number[]) => {
    if (typeof val === 'number') setVolume(val);
  };

  const handleSkipPrevious = () => {
    if (currentTrack) {
      updateTime(0);
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const playerHeight = isMobile ? PLAYER_HEIGHT_MOBILE : PLAYER_HEIGHT_DESKTOP;

  if (!currentTrack) return null;

  const sliderSx = {
    flex: 1,
    minWidth: 40,
    color: '#E93434',
    height: 3,
    '& .MuiSlider-thumb': {
      width: 12,
      height: 12,
      backgroundColor: '#E93434',
      boxShadow: '0 0 0 6px rgba(233,52,52,0.06)',
      '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(233,52,52,0.10)' },
    },
    '&:hover .MuiSlider-thumb': { opacity: 1 },
    '& .MuiSlider-rail': { backgroundColor: 'rgba(0,0,0,0.06)' },
    '& .MuiSlider-track': { backgroundColor: '#E93434', border: 'none' },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="footer-player"
        initial={{ y: playerHeight + 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: playerHeight + 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1300 }}
      >
        <Box sx={{ width: '100%', backgroundColor: '#fff', borderTop: '1px solid rgba(233,52,52,0.08)' }}>

          {/* ── MOBILE layout ─────────────────────────────────── */}
          {isMobile && (
            <Box sx={{ px: 1.5, pt: 1, pb: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {/* Row 1: track info + like */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={`${currentTrack.imageUrl}?t=${currentTrack.updatedAt || currentTrack.createdAt}`}
                  alt={currentTrack.title}
                  variant="rounded"
                  sx={{ width: 34, height: 34, borderRadius: '5px', flexShrink: 0, border: '1px solid rgba(233,52,52,0.14)', cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/track/${currentTrack.id}`); }}
                />
                <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <Typography
                    onClick={(e) => { e.stopPropagation(); navigate(`/track/${currentTrack.id}`); }}
                    sx={{ color: '#111', fontWeight: 600, fontSize: '0.80rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3, cursor: 'pointer' }}
                  >
                    {currentTrack.title}
                  </Typography>
                  <Typography
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${currentTrack.userId}`); }}
                    sx={{ color: 'rgba(0,0,0,0.55)', fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3, cursor: 'pointer' }}
                  >
                    {currentTrack.username}
                  </Typography>
                </Box>
                <IconButton onClick={async (e) => { e.stopPropagation(); await toggleLike(); }} size="small" sx={{ color: userLiked ? '#E93434' : 'rgba(0,0,0,0.5)', flexShrink: 0 }}>
                  {userLiked ? <Favorite sx={{ fontSize: 17 }} /> : <FavoriteBorder sx={{ fontSize: 17 }} />}
                </IconButton>
              </Box>

              {/* Row 2: controls + slider + time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton onClick={handleSkipPrevious} size="small" sx={{ color: 'rgba(0,0,0,0.55)', p: 0.5 }}>
                  <SkipPrevious sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton
                  onClick={handlePlayPause}
                  sx={{
                    backgroundColor: '#E93434', color: '#fff',
                    width: 32, height: 32, flexShrink: 0,
                    '&:hover': { backgroundColor: '#c62828' },
                    boxShadow: '0 4px 12px rgba(233,52,52,0.20)',
                  }}
                >
                  {isPlaying ? <Pause sx={{ fontSize: 18 }} /> : <PlayArrow sx={{ fontSize: 18 }} />}
                </IconButton>
                <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.55)', p: 0.5 }}>
                  <SkipNext sx={{ fontSize: 20 }} />
                </IconButton>

                <Slider value={currentTime} min={0} max={duration || 100} step={0.1} onChange={handleTimeChange} size="small" sx={sliderSx} />

                <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.62rem', flexShrink: 0, minWidth: 28, textAlign: 'right' }}>
                  {formatTime(currentTime)}
                  <Box component="span" sx={{ color: 'rgba(0,0,0,0.35)' }}>&nbsp;/&nbsp;{currentTrack.originalDuration}</Box>
                </Typography>
              </Box>
            </Box>
          )}

          {/* ── DESKTOP layout ────────────────────────────────── */}
          {!isMobile && (
            <Box
              sx={{
                width: '100%', maxWidth: 1100, mx: 'auto',
                height: PLAYER_HEIGHT_DESKTOP,
                display: 'flex', alignItems: 'center',
                px: 3, gap: 0,
              }}
            >
              {/* Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 70%', pr: 2 }}>
                <IconButton onClick={handleSkipPrevious} size="small" sx={{ color: 'rgba(0,0,0,0.65)', '&:hover': { color: '#111' } }}>
                  <SkipPrevious sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton
                  onClick={handlePlayPause}
                  sx={{
                    backgroundColor: '#E93434', color: '#fff', width: 38, height: 38,
                    '&:hover': { backgroundColor: '#c62828', transform: 'scale(1.06)' },
                    transition: 'all 0.18s ease',
                    boxShadow: '0 6px 18px rgba(233,52,52,0.16)'
                  }}
                >
                  {isPlaying ? <Pause sx={{ fontSize: 20 }} /> : <PlayArrow sx={{ fontSize: 20 }} />}
                </IconButton>
                <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.65)', '&:hover': { color: '#111' } }}>
                  <SkipNext sx={{ fontSize: 20 }} />
                </IconButton>
                <Typography sx={{ color: 'rgba(0,0,0,0.7)', fontSize: '0.68rem', flexShrink: 0, minWidth: 30, textAlign: 'right' }}>
                  {formatTime(currentTime)}
                </Typography>
                <Slider value={currentTime} min={0} max={duration || 100} step={0.1} onChange={handleTimeChange} size="small" sx={sliderSx} />
                <Typography sx={{ color: 'rgba(0,0,0,0.7)', fontSize: '0.68rem', flexShrink: 0, minWidth: 30 }}>
                  {currentTrack.originalDuration}
                </Typography>
                <Box ref={volumeRef} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 0.5 }}>
                  <IconButton size="small" onClick={() => setVolume(volume > 0 ? 0 : 0.8)} sx={{ color: 'rgba(0,0,0,0.75)', '&:hover': { color: '#111' } }}>
                    {volume === 0 ? <VolumeMute sx={{ fontSize: 18 }} /> : <VolumeUp sx={{ fontSize: 18 }} />}
                  </IconButton>
                  <Slider value={volume} min={0} max={1} step={0.01} onChange={handleVolumeChange} size="small" sx={{ width: 72, color: '#E93434', height: 3, '& .MuiSlider-thumb': { width: 10, height: 10, backgroundColor: '#E93434' }, '& .MuiSlider-rail': { backgroundColor: 'rgba(0,0,0,0.06)' }, '& .MuiSlider-track': { backgroundColor: '#E93434' } }} />
                </Box>
              </Box>

              {/* Divider */}
              <Box sx={{ width: '1px', height: 32, backgroundColor: 'rgba(233,52,52,0.12)', flexShrink: 0, mx: 2 }} />

              {/* Track info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '0 0 30%', minWidth: 0, pl: 2 }}>
                <Avatar
                  src={`${currentTrack.imageUrl}?t=${currentTrack.updatedAt || currentTrack.createdAt}`}
                  alt={currentTrack.title}
                  variant="rounded"
                  sx={{ width: 42, height: 42, borderRadius: '6px', flexShrink: 0, border: '1px solid rgba(233,52,52,0.14)', cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/track/${currentTrack.id}`); }}
                />
                <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                  <Typography onClick={(e) => { e.stopPropagation(); navigate(`/track/${currentTrack.id}`); }} sx={{ color: '#111', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{currentTrack.title}</Typography>
                  <Typography onClick={(e) => { e.stopPropagation(); navigate(`/user/${currentTrack.userId}`); }} sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.70rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{currentTrack.username}</Typography>
                </Box>
                <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <IconButton onClick={async (e) => { e.stopPropagation(); await toggleLike(); }} size="small" sx={{ color: userLiked ? '#E93434' : 'rgba(0,0,0,0.6)' }}>
                    {userLiked ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}

        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default Footer;
