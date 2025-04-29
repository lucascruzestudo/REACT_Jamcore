import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTrack } from '../contexts/trackcontext';
import { useNavigate } from 'react-router-dom';
import { useTrackInteraction } from '../hooks/usetrackinteraction';

interface TrackProps {
  key: string;
  id: string;
  title: string;
  tags: string[];
  audioFileUrl: string;
  imageUrl: string;
  username: string;
  userId: string;
  createdAt: string;
  likeCount: number;
  playCount: number;
  userLikedTrack: boolean;
  originalDuration: string;
  updatedAt: string;
}

const CompactTrack: React.FC<TrackProps> = ({
  id,
  imageUrl,
  title,
  audioFileUrl,
  username,
  userId,
  tags,
  createdAt,
  likeCount,
  playCount,
  userLikedTrack,
  originalDuration,
  updatedAt,
}) => {
  const { isPlaying, togglePlayPause, currentTrack } = useTrack();
  const { localLikeCount, localPlayCount, userLiked, incrementPlay, toggleLike } = useTrackInteraction({
    trackId: id,
    initialLikeCount: likeCount,
    initialPlayCount: playCount,
    initialUserLiked: userLikedTrack,
  });
  const navigate = useNavigate();

  const trackData = {
    key: id,
    id,
    title,
    tags,
    audioFileUrl,
    imageUrl,
    userId,
    username,
    createdAt,
    likeCount: localLikeCount,
    playCount: localPlayCount,
    userLikedTrack: userLiked,
    originalDuration,
    updatedAt,
  };

  const handlePlayPause = () => {
    togglePlayPause(trackData);
    incrementPlay();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, backgroundColor: 'white', borderRadius: 1 }}>
      <Box
        sx={{
          width: 50,
          height: 50,
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          border: '1px solid #ccc',
          '&:hover .play-pause-icon': {
            opacity: 1,
          },
        }}
        onClick={handlePlayPause}
      >
        <img
          src={`${imageUrl}?t=${updatedAt || createdAt}`}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <Box
          className="play-pause-icon"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            transition: 'opacity 0.3s',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '50%',
            padding: 1,
          }}
        >
          {isPlaying && id === currentTrack?.id ? (
            <PauseIcon fontSize="small" />
          ) : (
            <PlayArrowIcon fontSize="small" />
          )}
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          noWrap
          sx={{
            cursor: 'pointer',
            '&:hover': {
              fontWeight: 500,
            },
          }}
          onClick={() => navigate(`/user/${userId}`)}
        >
          {username}
        </Typography>
        <Typography
          variant="body2"
          noWrap
          sx={{
            cursor: 'pointer',
            '&:hover': {
              fontWeight: 500,
            },
          }}
          onClick={() => navigate(`/track/${id}`)}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PlayArrowIcon fontSize="small" color="action" />
          <Typography variant="caption" sx={{ ml: 0.5, color: 'secondary.main' }}>
            {localPlayCount}
          </Typography>
        </Box>

        <IconButton size="small" onClick={toggleLike}>
          {userLiked ? (
            <FavoriteIcon fontSize="small" color="primary" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
          <Typography variant="caption" sx={{ ml: 0.5, color: 'secondary.main' }}>
            {localLikeCount}
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

export default CompactTrack;