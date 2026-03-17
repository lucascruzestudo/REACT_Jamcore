import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  InputBase,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useTrack, Track as TrackItem } from '../contexts/trackcontext';
import TrackCover from './trackcover';
import { useNavigate } from 'react-router-dom';
import { useTrackInteraction } from '../hooks/usetrackinteraction';
import WaveformVisualizer from './waveformvisualizer';
import { useUser } from '../contexts/usercontext';
import { useCommentContext } from '../contexts/commentcontext';
import api from '../services/api';
import { AnimatePresence, motion } from 'framer-motion';

interface TrackProps {
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
  commentCount?: number;
  playlist?: TrackItem[];
  playlistIndex?: number;
}

function formatTimeAgo(createdAt: string): string {
  const date = new Date(createdAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffSeconds = Math.ceil(diffTime / 1000);
  const diffMinutes = Math.ceil(diffSeconds / 60);
  const diffHours = Math.ceil(diffMinutes / 60);
  const diffDays = Math.ceil(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds} segundo${diffSeconds !== 1 ? 's' : ''} atrás`;
  if (diffMinutes < 60) return `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''} atrás`;
  if (diffHours < 24) return `${diffHours} hora${diffHours !== 1 ? 's' : ''} atrás`;
  if (diffDays < 30) return `${diffDays} dia${diffDays !== 1 ? 's' : ''} atrás`;
  if (diffDays < 365) {
    const months = Math.ceil(diffDays / 30);
    return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
  }
  const years = Math.ceil(diffDays / 365);
  return `${years} ano${years !== 1 ? 's' : ''} atrás`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n || 0);
}

const Track: React.FC<TrackProps> = ({
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
  commentCount = 0,
  playlist,
  playlistIndex,
}) => {
  const { isPlaying, currentTime, duration, togglePlayPause, updateTime, currentTrack, setPlaylist, addToQueue, addAfterCurrent } =
    useTrack();
  const { localLikeCount, localPlayCount, userLiked, incrementPlay, toggleLike } =
    useTrackInteraction({
      trackId: id,
      initialLikeCount: likeCount,
      initialPlayCount: playCount,
      initialUserLiked: userLikedTrack,
    });

  const [modalOpen, setModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [commentSent, setCommentSent] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const { user, userProfile } = useUser();
  const { addComment, getComments } = useCommentContext();
  const navigate = useNavigate();

  const isActiveTrack = id === currentTrack?.id;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
  };

  const handleContextClose = () => setContextMenu(null);

  const trackData = {
    id,
    title,
    tags,
    audioFileUrl,
    imageUrl,
    username,
    userId,
    createdAt,
    likeCount: localLikeCount,
    playCount: localPlayCount,
    userLikedTrack: userLiked,
    originalDuration,
    updatedAt,
  };

  const activeDuration =
    isActiveTrack && duration > 0
      ? duration
      : originalDuration.split(':').map(Number).reduce((acc, p) => acc * 60 + p, 0);

  const displayCurrentTime = isActiveTrack
    ? `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}`
    : '0:00';

  const localCommentCount = getComments(id).length > 0 ? getComments(id).length : commentCount;

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const response = await api.post('/TrackComment', { trackId: id, comment: newComment });
      addComment(id, {
        id: response.data.data.id,
        text: newComment,
        userId: user?.id || userProfile?.userId || '',
        username: userProfile?.displayName || user?.username || '',
        displayName: userProfile?.displayName || user?.username || '',
        userProfilePictureUrl:
          userProfile?.profilePictureUrl || '/jamcoredefaultpicture.jpg',
        createdAt: new Date().toISOString(),
        userProfileUpdatedAt: userProfile?.updatedAt || '',
      });
      setNewComment('');
      setCommentSent(true);
      setTimeout(() => setCommentSent(false), 2000);
    } catch (e) {
      console.error('Error posting comment:', e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleBackgroundClick = () => {
    // Click in the empty area of the track card should start playing this track
    togglePlayPause(trackData);
    incrementPlay();
  };

  return (
    <Box
      onContextMenu={handleContextMenu}
      onClick={handleBackgroundClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: { xs: 600, sm: 700 },
        width: { xs: '100%', sm: 700 },
        m: 'auto',
        backgroundColor: '#fff',
        borderRadius: '14px',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.10)' },
      }}
    >
      {/* Main content row */}
      <Box sx={{ display: 'flex', p: 2, gap: 2, alignItems: 'flex-start' }}>
        {/* Cover image */}
        <Box
          sx={{
            width: 120,
            height: 120,
            flexShrink: 0,
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setModalOpen(true);
          }}
        >
          <img
            src={`${imageUrl}?t=${updatedAt || createdAt}`}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>

        {/* Right content */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Top row: artist / title :: date / tag */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#888',
                  letterSpacing: '0.02em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'block',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/${userId}`);
                }}
                noWrap
              >
                {username || ''}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.25,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/track/${id}`);
                }}
              >
                {title || ''}
              </Typography>
            </Box>

            {/* Date + tag */}
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="caption" color="textSecondary" noWrap sx={{ display: 'block' }}>
                {formatTimeAgo(createdAt)}
              </Typography>
              {tags.length > 0 && (
                <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(233,52,52,0.08)',
                      borderRadius: '6px',
                      px: 1,
                      py: '2px',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ fontWeight: 600, fontSize: '0.68rem' }}
                      noWrap
                    >
                      #{tags[0]}
                    </Typography>
                  </Box>
                  {tags.length > 1 && (
                    <Tooltip title={tags.slice(1).join(', ')} arrow>
                      <Box
                        sx={{
                          backgroundColor: '#F0F0F0',
                          borderRadius: '6px',
                          px: 1,
                          py: '2px',
                          cursor: 'default',
                        }}
                      >
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.68rem' }}>
                          +{tags.length - 1}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Waveform row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => { if (playlist && playlistIndex !== undefined) setPlaylist(playlist, playlistIndex); togglePlayPause(trackData); incrementPlay(); }}
              onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
              sx={{
                bgcolor: 'primary.main',
                color: '#fff',
                width: 32,
                height: 32,
                flexShrink: 0,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              {isPlaying && isActiveTrack ? (
                <PauseIcon sx={{ fontSize: 18 }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <WaveformVisualizer
                audioUrl={audioFileUrl}
                currentTime={isActiveTrack ? currentTime : 0}
                duration={activeDuration}
                isActive={isActiveTrack}
                onSeek={(time) => {
                  if (isActiveTrack) {
                    updateTime(time);
                    return;
                  }

                  // If clicking a waveform of a non-active track, only switch to that track
                  // (do not seek). The user can click again to seek to a specific time.
                  if (playlist && playlistIndex !== undefined) setPlaylist(playlist, playlistIndex);
                  togglePlayPause(trackData);
                }}
                height={52}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#aaa' }}>
                  {displayCurrentTime}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#aaa' }}>
                  {originalDuration}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Inline comment input */}
          {user && (
            <Box
              sx={{
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: '24px',
                px: 1.5,
                py: 0.5,
                bgcolor: '#FAFAFA',
                overflow: 'hidden',
                minHeight: 36,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {commentSent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.8rem' }}>
                      comentário enviado!
                    </Typography>
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
                  >
                    <Avatar
                      src={
                        userProfile?.profilePictureUrl
                          ? `${userProfile.profilePictureUrl}?t=${userProfile.updatedAt || ''}`
                          : '/jamcoredefaultpicture.jpg'
                      }
                      sx={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%' }}
                    />
                    <InputBase
                      placeholder="Escreva um comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCommentSubmit();
                        }
                      }}
                      sx={{ flex: 1, fontSize: '0.82rem', color: '#555' }}
                    />
                    {newComment.trim() && (
                      <IconButton
                        size="small"
                        onClick={handleCommentSubmit}
                        disabled={isPosting}
                        sx={{ color: 'primary.main', p: 0.5 }}
                      >
                        <SendIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          )}
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', mx: 2 }} />

      {/* Bottom stats bar: actions left, counters right */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="copiar link">
            <Button
              startIcon={<LinkIcon sx={{ fontSize: 15 }} />}
              variant="text"
              color="secondary"
              size="small"
              onClick={() => {
                const url = window.location.href.split('/').slice(0, 3).join('/') + `/track/${id}`;
                navigator.clipboard.writeText(url);
              }}
              sx={{ color: 'secondary.main', p: 0.5, textTransform: 'none', fontSize: '0.8rem', minWidth: 'auto' }}
            >
              copiar link
            </Button>
          </Tooltip>
        </Box>

        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            startIcon={<PlayArrowIcon sx={{ fontSize: 15 }} />}
            variant="text"
            color="secondary"
            size="small"
            disableRipple
            sx={{ minWidth: 0, fontSize: '0.75rem' }}
          >
            {formatCount(localPlayCount)}
          </Button>

          <Button
            startIcon={
              userLiked ? (
                <FavoriteIcon sx={{ fontSize: 15 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 15 }} />
              )
            }
            variant="text"
            color={userLiked ? 'primary' : 'secondary'}
            size="small"
            sx={{ minWidth: 0, fontSize: '0.75rem' }}
            onClick={toggleLike}
          >
            {formatCount(localLikeCount)}
          </Button>

          <Button
            startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />}
            variant="text"
            color="secondary"
            size="small"
            sx={{ minWidth: 0, fontSize: '0.75rem' }}
            onClick={() => navigate(`/track/${id}`)}
          >
            {formatCount(localCommentCount)}
          </Button>
        </Box>
      </Box>

      <TrackCover open={modalOpen} onClose={() => setModalOpen(false)} imageUrl={imageUrl} title={title} />

      {/* Right-click context menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        slotProps={{ paper: { sx: { borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 200 } } }}
      >
        <MenuItem
          onClick={() => {
            addAfterCurrent(trackData);
            handleContextClose();
          }}
          dense
        >
          <ListItemIcon><QueueMusicIcon fontSize="small" sx={{ color: '#E93434' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.83rem' }}>tocar a seguir</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            addToQueue(trackData);
            handleContextClose();
          }}
          dense
        >
          <ListItemIcon><PlaylistAddIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.5)' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.83rem' }}>adicionar à fila</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Track;

