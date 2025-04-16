import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Button,
  Divider,
  Tooltip,
  Grid,
  TextField,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import { AddComment, Comment, DeleteOutline, Edit } from '@mui/icons-material';
import api from '../services/api';
import { useTrack } from '../contexts/trackcontext';
import { useUser } from '../contexts/usercontext';
import TrackCover from './trackcover';
import CommentComponent from './comment';
import { useNavigate } from 'react-router-dom';
import { useTrackInteraction } from '../hooks/useTrackInteraction';

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
}) => {
  const { isPlaying, currentTime, duration, togglePlayPause, updateTime, currentTrack } = useTrack();
  const { localLikeCount, localPlayCount, userLiked, incrementPlay, toggleLike } = useTrackInteraction({
    trackId: id,
    initialLikeCount: likeCount,
    initialPlayCount: playCount,
    initialUserLiked: userLikedTrack,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const [isCommenting, setIsCommenting] = useState(false);
  const { user, userProfile } = useUser();
  const navigate = useNavigate();
  const isUploader = user?.id === userId;

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

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

  const updateSliderTime = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      updateTime(newValue);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') return;

    setIsCommenting(true);

    try {
      const response = await api.post('/TrackComment', {
        trackId: id,
        comment: newComment,
      });

      const newCommentData = {
        id: response.data.data.id,
        text: newComment,
        userId: user?.id || userProfile?.userId || '',
        username: userProfile?.displayName || user?.displayName || '',
        userProfilePictureUrl: userProfile?.profilePictureUrl || user?.profilePictureUrl || '/jamcoredefaultpicture.jpg',
        createdAt: new Date().toISOString(),
        displayName: userProfile?.displayName || user?.username || '',
        userProfileUpdatedAt: userProfile?.updatedAt || user?.updatedAt || '',
      };

      setLocalComments([newCommentData, ...localComments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete('/TrackComment', {
        data: {
          trackId: id,
          commentId: commentId,
        },
      });

      setLocalComments(localComments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, width: '100%', m: 'auto', backgroundColor: 'white' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              width: '100%',
              height: 300,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              border: '1px solid #ccc',
            }}
            onClick={handleOpenModal}
          >
            <img
              src={`${imageUrl}?t=${updatedAt || createdAt}`}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Box sx={{ cursor: 'pointer' }} onClick={() => navigate(`/user/${userId}`)}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      noWrap
                      sx={{ '&:hover': { fontWeight: '500' } }}
                    >
                      {username || 'null'}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{ cursor: 'pointer', '&:hover': { fontWeight: '500' } }}
                  >
                    {title || 'null'}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  {(() => {
                    const date = new Date(createdAt);
                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - date.getTime());
                    const diffSeconds = Math.ceil(diffTime / 1000);
                    const diffMinutes = Math.ceil(diffSeconds / 60);
                    const diffHours = Math.ceil(diffMinutes / 60);
                    const diffDays = Math.ceil(diffHours / 24);

                    if (diffSeconds < 60) {
                      return (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {diffSeconds === 1 ? `${diffSeconds} segundo atrás` : `${diffSeconds} segundos atrás`}
                        </Typography>
                      );
                    } else if (diffMinutes < 60) {
                      return (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {diffMinutes === 1 ? `${diffMinutes} minuto atrás` : `${diffMinutes} minutos atrás`}
                        </Typography>
                      );
                    } else if (diffHours < 24) {
                      return (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {diffHours === 1 ? `${diffHours} hora atrás` : `${diffHours} horas atrás`}
                        </Typography>
                      );
                    } else if (diffDays < 30) {
                      return (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {diffDays === 1 ? `${diffDays} dia atrás` : `${diffDays} dias atrás`}
                        </Typography>
                      );
                    } else if (diffDays < 365) {
                      return (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {diffDays === 30
                            ? `${Math.ceil(diffDays / 30)} mês atrás`
                            : `${Math.ceil(diffDays / 30)} meses atrás`}
                        </Typography>
                      );
                    } else {
                      return (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {diffDays === 365
                            ? `${Math.ceil(diffDays / 365)} ano atrás`
                            : `${Math.ceil(diffDays / 365)} anos atrás`}
                        </Typography>
                      );
                    }
                  })()}

                  <Box sx={{ display: 'inline-block', ...(tags.length > 1 && { gap: 1 }) }}>
                    <Box
                      sx={{
                        backgroundColor: '#eee',
                        borderRadius: '8px',
                        padding: '2px 8px',
                        display: 'inline-block',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Typography variant="body2" color="textPrimary" noWrap>
                        #{tags[0]}
                      </Typography>
                    </Box>
                    {tags.length > 1 && (
                      <Box
                        sx={{
                          backgroundColor: '#eee',
                          borderRadius: '8px',
                          padding: '2px 8px',
                          marginLeft: '4px',
                          display: 'inline-block',
                          fontSize: '0.75rem',
                        }}
                      >
                        <Tooltip title={tags.slice(1).join(', ')} arrow>
                          <Typography variant="body2" color="textPrimary" noWrap>
                            +{tags.length - 1}
                          </Typography>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {!description ? null : (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {description || 'No description available.'}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <IconButton
          onKeyDown={(event) => {
            if (event.key === ' ') {
              event.preventDefault();
            }
          }}
          onClick={async () => {
            togglePlayPause(trackData);
            incrementPlay();
          }}
        >
          {isPlaying && id === currentTrack?.id ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
        </IconButton>

        <Slider
          value={id === currentTrack?.id ? currentTime : 0}
          min={0}
          max={id === currentTrack?.id ? duration : (() => {
            const timeParts = originalDuration.split(':').map(Number);
            return timeParts.reduce((acc, part) => acc * 60 + part, 0);
          })()}
          onChange={updateSliderTime}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`}
          sx={{
            flex: 1,
            mx: 2,
            '& .MuiSlider-thumb': { display: 'none' },
          }}
          disabled={id !== currentTrack?.id}
        />

        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', pl: 2 }}>
          {id === currentTrack?.id
            ? `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')} / ${originalDuration}`
            : `00:00 / ${originalDuration}`}
        </Typography>
      </Box>

      <Divider sx={{ my: 1, borderColor: 'transparent' }} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'nowrap',
          width: '100%',
        }}
      >
        <Button
          startIcon={<PlayArrowIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
          variant="text"
          color="secondary"
          size="small"
          sx={{ py: { xs: 1, sm: 0.5 } }}
        >
          {localPlayCount >= 1000000
            ? `${(localPlayCount / 1000000).toFixed(1)}m`
            : localPlayCount >= 1000
              ? `${(localPlayCount / 1000).toFixed(1)}k`
              : localPlayCount || 0}
        </Button>
        <Button
          startIcon={
            userLiked ? (
              <FavoriteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
            )
          }
          variant="text"
          color={userLiked ? 'primary' : 'secondary'}
          size="small"
          sx={{ py: { xs: 1, sm: 0.5 } }}
          onClick={toggleLike}
        >
          {localLikeCount >= 1000000
            ? `${(localLikeCount / 1000000).toFixed(1)}m`
            : localLikeCount >= 1000
              ? `${(localPlayCount / 1000).toFixed(1)}k`
              : localLikeCount || 0}
        </Button>
        <Button
          startIcon={<LinkIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
          variant="text"
          color="secondary"
          size="small"
          sx={{ py: { xs: 1, sm: 0.5 } }}
          onClick={() => {
            const url = window.location.href.split('/').slice(0, 3).join('/') + `/track/${id}`;
            navigator.clipboard.writeText(url);
          }}
        >
          copiar link
        </Button>
        {isUploader && (
          <Button
            startIcon={<Edit sx={{ fontSize: { xs: 16, sm: 20 } }} />}
            variant="text"
            color="secondary"
            size="small"
            sx={{ py: { xs: 1, sm: 0.5 } }}
            onClick={() => navigate(`/track/${id}/edit`)}
          >
            editar
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        comentários
      </Typography>

      <Divider sx={{ my: 1, borderColor: 'transparent' }} />

      <Box sx={{ mb: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={10}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Adicionar um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={isCommenting}
              sx={{
                height: '56px',
                backgroundColor: isCommenting ? '#ccc' : 'primary.main',
              }}
              onClick={handleCommentSubmit}
            >
              {isCommenting ? <Comment /> : <AddComment />}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2, borderColor: 'transparent' }} />

      {localComments.length > 0 ? (
        localComments
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((comment, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <CommentComponent comment={comment} />
              {comment.userId === user?.id && (
                <IconButton onClick={() => handleDeleteComment(comment.id)}>
                  <DeleteOutline />
                </IconButton>
              )}
            </Box>
          ))
      ) : (
        <Typography variant="body1" color="textSecondary">
          nenhum comentário...
        </Typography>
      )}

      <TrackCover
        open={modalOpen}
        onClose={handleCloseModal}
        imageUrl={`${imageUrl}?t=${trackData.updatedAt || trackData.createdAt}`}
        title={title}
      />

      <Divider sx={{ marginTop: 8, borderColor: 'transparent' }} />
    </Box>
  );
};

export default DetailedTrack;