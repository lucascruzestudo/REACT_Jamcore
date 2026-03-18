import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Avatar,
  InputBase,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Popover,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DeleteOutline, Edit } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import api from '../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from './confirmdialog';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useTrack } from '../contexts/trackcontext';
import WaveformVisualizer from './waveformvisualizer';
import { useUser } from '../contexts/usercontext';
import TrackCover from './trackcover';
import CommentComponent from './comment';
import { useNavigate } from 'react-router-dom';
import { useTrackInteraction } from '../hooks/usetrackinteraction';
import { useCommentContext } from '../contexts/commentcontext';
import { AnimatePresence, motion } from 'framer-motion';
import { cropToSquare } from '../utils/imageUtils';

interface DetailedTrackProps {
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
  description: string;
  comments: {
    id: string;
    text: string;
    userId: string;
    username: string;
    displayName: string;
    userProfilePictureUrl: string;
    createdAt: string;
    userProfileUpdatedAt: string;
  }[];
  updatedAt: string;
  onUpdate?: () => void;
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

const DetailedTrack: React.FC<DetailedTrackProps> = ({
  id,
  imageUrl,
  title,
  audioFileUrl,
  userId,
  username,
  tags,
  createdAt,
  likeCount,
  playCount,
  userLikedTrack,
  originalDuration,
  description,
  comments,
  updatedAt,
  onUpdate,
}) => {
  const { isPlaying, currentTime, duration, togglePlayPause, playWithContext, updateTime, currentTrack, setCurrentTrack, setIsPlaying, audioRef, addToQueue, addAfterCurrent } = useTrack();
  const { localLikeCount, localPlayCount, userLiked, incrementPlay, toggleLike } = useTrackInteraction({
    trackId: id,
    initialLikeCount: likeCount,
    initialPlayCount: playCount,
    initialUserLiked: userLikedTrack,
  });
  const { getComments, addComment, removeComment } = useCommentContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentSent, setCommentSent] = useState(false);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());
  const [tagsAnchor, setTagsAnchor] = useState<HTMLElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const { user, userProfile } = useUser();
  const navigate = useNavigate();
  const isUploader = user?.id === userId;

  // ── Inline edit ──
  const [isEditing, setIsEditing] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState(`${imageUrl}?t=${updatedAt || createdAt}`);
  const [editTagsInput, setEditTagsInput] = useState('');
  const [editImageHovered, setEditImageHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { control: editControl, handleSubmit: handleEditFormSubmit, setValue: setEditValue, watch: watchEdit, reset: resetEdit } = useForm({
    defaultValues: { title, description, isPublic: true, tags: [...tags], imageFile: null as File | null },
  });

  const openEdit = () => {
    resetEdit({ title, description, isPublic: true, tags: [...tags], imageFile: null });
    setEditImagePreview(`${imageUrl}?t=${updatedAt || createdAt}`);
    setEditTagsInput('');
    setIsEditing(true);
  };

  const handleEditImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const squared = await cropToSquare(event.target.files[0]);
      setEditValue('imageFile', squared);
      setEditImagePreview(URL.createObjectURL(squared));
    }
  };

  const handleEditTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = editTagsInput.trim();
      if (tag) {
        setEditValue('tags', [...watchEdit('tags'), tag.toLowerCase()]);
        setEditTagsInput('');
      }
    }
  };

  const removeEditTag = (index: number) => {
    setEditValue('tags', watchEdit('tags').filter((_, i) => i !== index));
  };

  const onEditSubmit = async (data: { title: string; description: string; isPublic: boolean; tags: string[]; imageFile: File | null }) => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('trackId', id);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('isPublic', data.isPublic ? 'true' : 'false');
    data.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));
    if (data.imageFile) formData.append('imageFile', data.imageFile);
    try {
      await api.put('/Track', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsEditing(false);
      onUpdate?.();
    } catch (err) {
      console.error('Error updating track:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    resetEdit({ title, description, isPublic: true, tags: [...tags], imageFile: null });
    setEditImagePreview(`${imageUrl}?t=${updatedAt || createdAt}`);
    setEditTagsInput('');
    setIsEditing(false);
  };

  const isActiveTrack = id === currentTrack?.id;

  const activeDuration = isActiveTrack && duration > 0
    ? duration
    : originalDuration.split(':').map(Number).reduce((acc, p) => acc * 60 + p, 0);

  const displayCurrentTime = isActiveTrack
    ? `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}`
    : '0:00';

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

  // fetch uploader profile for display in the track details
  const { data: uploaderProfile } = useQuery<any, Error>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const resp = await api.get(`Profile/${userId}`);
      return resp.data.data.userProfile;
    },
    enabled: !!userId,
  });

  const queryClient = useQueryClient();

  // Combina comentários da API com os do contexto, evitando duplicatas
  const localComments = [
    ...getComments(id),
    ...comments.filter((c) => !getComments(id).some((ctx) => ctx.id === c.id)),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '' || isCommenting) return;
    setIsCommenting(true);
    try {
      const response = await api.post('/TrackComment', { trackId: id, comment: newComment });
      addComment(id, {
        id: response.data.data.id,
        text: newComment,
        userId: user?.id || userProfile?.userId || '',
        username: userProfile?.displayName || user?.username || '',
        displayName: userProfile?.displayName || user?.username || '',
        userProfilePictureUrl: userProfile?.profilePictureUrl || '/jamcoredefaultpicture.jpg',
        createdAt: new Date().toISOString(),
        userProfileUpdatedAt: userProfile?.updatedAt || '',
      });
      setNewComment('');
      setCommentSent(true);
      setTimeout(() => setCommentSent(false), 2000);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete('/TrackComment', { data: { trackId: id, commentId } });
      // show deleted animation in-place
      setDeletedCommentIds((prev) => new Set(prev).add(commentId));
      setTimeout(() => {
        removeComment(id, commentId);
        queryClient.invalidateQueries({ queryKey: ['track', id] });
        onUpdate?.();
        setDeletedCommentIds((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      }, 2000);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteTrack = () => {
    setConfirmOpen(true);
  };

  const handleDeleteTrackConfirmed = async () => {
    setConfirmOpen(false);
    try {
      await api.delete('/Track', { data: { trackId: id } });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userTracks', userId] });
      if (currentTrack?.id === id) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setCurrentTrack(null);
      }
      navigate('/feed');
    } catch (error) {
      console.error('Error deleting track:', error);
    }
  };

  return (
    <Box
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ mouseX: e.clientX + 2, mouseY: e.clientY - 4 });
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* ── Banner: two-column layout ── */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch', gap: { xs: 1.5, sm: 2 } }}>

        {/* Left: [play + title/artist | date+tags] row + waveform */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Top row: play + info block */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 1.5 } }}>

            {/* Play button */}
            <IconButton
              onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
              onClick={() => { playWithContext(trackData, [trackData], 0); incrementPlay(); }}
              sx={{
                bgcolor: '#111',
                color: '#fff',
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                flexShrink: 0,
                '&:hover': { bgcolor: '#333' },
              }}
            >
              {isPlaying && isActiveTrack ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            {/* Info: artist+title (left) | date+tags (right) */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', gap: 1, mt: 0.25 }}>

              {/* Artist + title */}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#666', fontWeight: 600, cursor: 'pointer', display: 'block', '&:hover': { color: 'primary.main' } }}
                  onClick={() => navigate(`/user/${userId}`)}
                  noWrap
                >
                  {username || ''}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: { xs: 2, sm: 1 },
                    fontSize: { xs: '1.1rem', sm: '1.5rem' },
                  }}
                >
                  {title || ''}
                </Typography>
              </Box>

              {/* Date + tags — right side, top-aligned on desktop, inline on mobile */}
              <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.5, mt: { xs: 0.5, sm: 0 } }}>
                <Typography variant="caption" color="textSecondary" noWrap>
                  {formatTimeAgo(createdAt)}
                </Typography>
                {tags.length > 0 && (
                  <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/search?q=${encodeURIComponent(tags[0])}`);
                      }}
                      sx={{
                        backgroundColor: 'rgba(233,52,52,0.08)',
                        borderRadius: '6px',
                        px: 1,
                        py: '2px',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(233,52,52,0.16)' },
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
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          setTagsAnchor(e.currentTarget);
                        }}
                        sx={{
                          backgroundColor: '#F0F0F0',
                          borderRadius: '6px',
                          px: 1,
                          py: '2px',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#E0E0E0' },
                        }}
                      >
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.68rem' }}>
                          +{tags.length - 1}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                <Popover
                  open={Boolean(tagsAnchor)}
                  anchorEl={tagsAnchor}
                  onClose={() => setTagsAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        p: 1.5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        maxWidth: 240,
                      },
                    },
                  }}
                >
                  {tags.slice(1).map((tag) => (
                    <Box
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTagsAnchor(null);
                        navigate(`/search?q=${encodeURIComponent(tag)}`);
                      }}
                      sx={{
                        backgroundColor: 'rgba(233,52,52,0.08)',
                        borderRadius: '6px',
                        px: 1,
                        py: '2px',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(233,52,52,0.16)' },
                      }}
                    >
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                        #{tag}
                      </Typography>
                    </Box>
                  ))}
                </Popover>
              </Box>
            </Box>
          </Box>

          {/* Waveform */}
          <Box sx={{ mt: 1.5 }}>
            <WaveformVisualizer
              audioUrl={audioFileUrl}
              currentTime={isActiveTrack ? currentTime : 0}
              duration={activeDuration}
              isActive={isActiveTrack}
              onSeek={(time) => {
                if (isActiveTrack) { updateTime(time); return; }
                playWithContext(trackData, [trackData], 0);
              }}
              height={52}
              unplayedColor="rgba(0,0,0,0.12)"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25, pb: 1.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#888' }}>{displayCurrentTime}</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#888' }}>{originalDuration}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: square cover only (desktop column, mobile full-width square below) */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 150 },
            alignSelf: 'stretch',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.10)',
            cursor: 'pointer',
            mb: 1,
            display: 'flex',
            height: { xs: 'auto', sm: 150 },
          }}
          onClick={() => setModalOpen(true)}
        >
          <img
            src={`${imageUrl}?t=${updatedAt || createdAt}`}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
      </Box>

      {/* ── White body ── */}

      {/* Actions bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 1.5, sm: 2 }, py: 0.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            startIcon={<LinkIcon sx={{ fontSize: 15 }} />}
            variant="text"
            color="secondary"
            size="small"
            sx={{ textTransform: 'none', fontSize: '0.8rem' }}
            onClick={() => {
              const url = window.location.href.split('/').slice(0, 3).join('/') + `/track/${id}`;
              navigator.clipboard.writeText(url);
            }}
          >
            copiar link
          </Button>
          {isUploader && (
            <Button
              startIcon={isEditing ? <CloseIcon sx={{ fontSize: 15 }} /> : <Edit sx={{ fontSize: 15 }} />}
              variant="text"
              color={isEditing ? 'primary' : 'secondary'}
              size="small"
              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
              onClick={() => isEditing ? setIsEditing(false) : openEdit()}
            >
              {isEditing ? 'cancelar' : 'editar'}
            </Button>
          )}
          {isUploader && (
            <Button
              startIcon={<DeleteOutline sx={{ fontSize: 15 }} />}
              variant="text"
              color="error"
              size="small"
              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
              onClick={handleDeleteTrack}
            >
              excluir
            </Button>
          )}
          <Button
            startIcon={<MoreHorizIcon sx={{ fontSize: 18 }} />}
            variant="text"
            color="secondary"
            size="small"
            sx={{ textTransform: 'none', fontSize: '0.8rem' }}
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({ mouseX: e.clientX + 2, mouseY: e.clientY - 4 });
            }}
          >
            mais ações
          </Button>
        </Box>

        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1, mr: { xs: 1, sm: 2 } }}>
          <Button
            startIcon={<PlayArrowIcon sx={{ fontSize: 15 }} />}
            variant="text" color="secondary" size="small" disableRipple
            sx={{ minWidth: 0, fontSize: '0.75rem' }}
          >
            {formatCount(localPlayCount)}
          </Button>
          <Button
            startIcon={userLiked ? <FavoriteIcon sx={{ fontSize: 15 }} /> : <FavoriteBorderIcon sx={{ fontSize: 15 }} />}
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
            variant="text" color="secondary" size="small" disableRipple
            sx={{ minWidth: 0, fontSize: '0.75rem' }}
          >
            {formatCount(localComments.length)}
          </Button>
        </Box>
      </Box>

      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        slotProps={{ paper: { sx: { borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 200 } } }}
      >
        <MenuItem
          onClick={() => {
            addAfterCurrent(trackData);
            setContextMenu(null);
          }}
          dense
        >
          <ListItemIcon>
            <QueueMusicIcon fontSize="small" sx={{ color: '#E93434' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.83rem' }}>tocar a seguir</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            addToQueue(trackData);
            setContextMenu(null);
          }}
          dense
        >
          <ListItemIcon>
            <PlaylistAddIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.5)' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.83rem' }}>adicionar à fila</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Inline edit panel ── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            key="edit-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)', bgcolor: '#FAFAFA' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                editar jam
              </Typography>
              <form onSubmit={handleEditFormSubmit(onEditSubmit)}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5, alignItems: 'flex-start' }}>

                  {/* Cover image */}
                  <Box
                    sx={{ flexShrink: 0, width: { xs: '100%', sm: 140 }, aspectRatio: '1/1', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', bgcolor: '#F0F0F0', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={() => setEditImageHovered(true)}
                    onMouseLeave={() => setEditImageHovered(false)}
                  >
                    <img src={editImagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {editImageHovered && (
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton component="label" sx={{ color: '#fff' }}>
                          <CloudUploadIcon />
                          <input type="file" hidden accept="image/*" onChange={handleEditImage} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Fields */}
                  <Box sx={{ flex: 1, width: '100%' }}>
                    <Controller
                      name="title"
                      control={editControl}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <TextField {...field} label="título" fullWidth margin="dense" size="small" />
                      )}
                    />
                    <Controller
                      name="description"
                      control={editControl}
                      render={({ field }) => (
                        <TextField {...field} label="descrição" fullWidth margin="dense" size="small" multiline rows={3} />
                      )}
                    />
                    <FormControl sx={{ mt: 1 }}>
                      <FormLabel sx={{ fontSize: '0.75rem' }}>privacidade</FormLabel>
                      <Controller
                        name="isPublic"
                        control={editControl}
                        render={({ field }) => (
                          <RadioGroup
                            {...field}
                            row
                            value={field.value ? 'public' : 'private'}
                            onChange={(e) => field.onChange(e.target.value === 'public')}
                          >
                            <FormControlLabel value="public" control={<Radio size="small" />} label={<Typography variant="caption">pública</Typography>} />
                            <FormControlLabel value="private" control={<Radio size="small" />} label={<Typography variant="caption">privada</Typography>} />
                          </RadioGroup>
                        )}
                      />
                    </FormControl>
                    <TextField
                      label="tags"
                      fullWidth
                      margin="dense"
                      size="small"
                      value={editTagsInput}
                      onChange={(e) => setEditTagsInput(e.target.value)}
                      onKeyDown={handleEditTagsKeyDown}
                      placeholder="Enter ou vírgula para adicionar"
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {watchEdit('tags').map((tag, i) => (
                        <Box key={i} sx={{ backgroundColor: 'rgba(233,52,52,0.08)', border: '1px solid rgba(233,52,52,0.2)', borderRadius: '8px', px: 1, py: '2px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="primary" sx={{ fontSize: '0.75rem' }}>#{tag}</Typography>
                          <IconButton size="small" onClick={() => removeEditTag(i)} sx={{ p: '1px' }}>
                            <CloseIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="text"
                        color="secondary"
                        size="small"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        sx={{ mr: 1, textTransform: 'none' }}
                      >
                        cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={isSaving || !watchEdit('title')}
                        sx={{ px: 3, borderRadius: '8px', fontWeight: 700 }}
                      >
                        {isSaving ? 'salvando...' : 'salvar'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </form>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploader + Description section: profile left, description right */}
      {(uploaderProfile || description) && (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            {/* Left: uploader profile */}
            <Box sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}>
              {uploaderProfile && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ width: { xs: 64, sm: 88 }, flexShrink: 0 }}>
                    <Avatar
                      src={uploaderProfile.profilePictureUrl ? `${uploaderProfile.profilePictureUrl}?t=${uploaderProfile.updatedAt || ''}` : '/jamcoredefaultpicture.jpg'}
                      sx={{ width: { xs: 64, sm: 88 }, height: { xs: 64, sm: 88 }, borderRadius: '50%', cursor: 'pointer' }}
                      onClick={() => navigate(`/user/${uploaderProfile.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/user/${uploaderProfile.id}`); }}
                      tabIndex={0}
                    />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#111', cursor: 'pointer' }}
                      onClick={() => navigate(`/user/${uploaderProfile.id}`)}
                    >
                      {uploaderProfile.displayName || uploaderProfile.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>@{uploaderProfile.username}</Typography>
                    {uploaderProfile.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <PlaceOutlinedIcon sx={{ fontSize: 16, color: '#aaa' }} />
                        <Typography variant="body2" sx={{ color: '#555' }}>{uploaderProfile.location}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Divider (only on desktop) */}
            <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', bgcolor: 'rgba(0,0,0,0.06)', borderRadius: '1px', alignSelf: 'stretch' }} />

            {/* Right: description */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {description ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555', lineHeight: 1.7 }}>
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>
      )}

      {/* Comments section */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: '#333', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}
        >
          comentários {localComments.length > 0 && `· ${localComments.length}`}
        </Typography>

        {/* Comment input */}
        {user && (
          <Box
            sx={{
              border: '1px solid rgba(0,0,0,0.10)',
              borderRadius: '24px',
              px: 1.5,
              py: 0.5,
              bgcolor: '#FAFAFA',
              overflow: 'hidden',
              minHeight: 42,
              display: 'flex',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {commentSent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.85rem' }}>
                    comentário enviado!
                  </Typography>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
                >
                  <Avatar
                    src={userProfile?.profilePictureUrl ? `${userProfile.profilePictureUrl}?t=${userProfile.updatedAt || ''}` : '/jamcoredefaultpicture.jpg'}
                    sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%' }}
                  />
                  <InputBase
                    placeholder="adicionar um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(); } }}
                    sx={{ flex: 1, fontSize: '0.88rem', color: '#555' }}
                  />
                  {newComment.trim() && (
                    <IconButton size="small" onClick={handleCommentSubmit} disabled={isCommenting} sx={{ color: 'primary.main', p: 0.5 }}>
                      <SendIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        )}

        {/* Comment list */}
        {localComments.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {localComments.map((comment) => (
              <Box
                key={comment.id}
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, pr: 0.5 }}
              >
                {deletedCommentIds.has(comment.id) ? (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', mb: 2 }}>
                    <motion.div
                      key={`deleted-${comment.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                        comentário excluído
                      </Typography>
                    </motion.div>
                  </Box>
                ) : (
                  <>
                    <CommentComponent comment={comment} />
                    {(comment.userId === user?.id || isUploader) && (
                      <IconButton size="small" onClick={() => handleDeleteComment(comment.id)} sx={{ color: '#bbb', mt: 1, '&:hover': { color: 'error.main' } }}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>
            nenhum comentário ainda. seja o primeiro!
          </Typography>
        )}
      </Box>

      <TrackCover
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        imageUrl={`${imageUrl}?t=${updatedAt || createdAt}`}
        title={title}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="excluir jam"
        description="tem certeza que deseja excluir esta jam? essa ação não pode ser desfeita."
        confirmText="excluir"
        cancelText="cancelar"
        onConfirm={handleDeleteTrackConfirmed}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default DetailedTrack;
