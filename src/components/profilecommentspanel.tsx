import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../services/api';
import { useUser } from '../contexts/usercontext';
import CommentComponent from './comment';

interface ProfileCommentItem {
  id: string;
  text: string;
  userProfileId: string;
  userId: string;
  username: string;
  displayName: string;
  userProfilePictureUrl?: string;
  userProfileUpdatedAt?: string;
  createdAt: string;
}

interface ProfileCommentsPanelProps {
  userProfileId: string;
  profileOwnerUserId?: string;
  onCountChange?: (count: number) => void;
}

const ProfileCommentsPanel: React.FC<ProfileCommentsPanelProps> = ({ userProfileId, profileOwnerUserId, onCountChange }) => {
  const queryClient = useQueryClient();
  const { user, userProfile } = useUser();

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [commentSent, setCommentSent] = useState(false);
  const [commentDeleted, setCommentDeleted] = useState(false);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['userProfileComments', userProfileId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('UserProfileComment/byProfile', {
        params: {
          userProfileId,
          pageNumber: pageParam,
          pageSize: 6,
        },
      });

      const comments = response.data.data.comments;
      return comments;
    },
    enabled: !!userProfileId,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (comment: string) =>
      api.post('UserProfileComment', { userProfileId, comment }),
    onSuccess: () => {
      setNewComment('');
      setCommentSent(true);
      setTimeout(() => setCommentSent(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['userProfileComments', userProfileId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ commentId, comment }: { commentId: string; comment: string }) =>
      api.put('UserProfileComment', { commentId, comment }),
    onSuccess: () => {
      setEditingCommentId(null);
      setEditingText('');
      queryClient.invalidateQueries({ queryKey: ['userProfileComments', userProfileId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => api.delete('UserProfileComment', { data: { commentId } }),
    onSuccess: (_data, commentId) => {
      // show deleted animation in-place for this comment id
      setDeletedCommentIds((prev) => new Set(prev).add(commentId));
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['userProfileComments', userProfileId] });
        setDeletedCommentIds((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      }, 2000);
    },
  });

  const comments: ProfileCommentItem[] = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.items) ?? [];
  }, [data]);

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  useEffect(() => {
    if (onCountChange && data !== undefined) {
      onCountChange(totalCount);
    }
  }, [totalCount, data, onCountChange]);

  const handleCreateComment = async () => {
    if (!newComment.trim() || createMutation.isPending) return;
    await createMutation.mutateAsync(newComment.trim());
  };

  const startEdit = (comment: ProfileCommentItem) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.07)',
        p: { xs: 2, md: 3 },
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: '#333', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}
      >
        comentários {totalCount > 0 && `· ${totalCount}`}
      </Typography>

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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateComment();
                    }
                  }}
                  sx={{ flex: 1, fontSize: '0.88rem', color: '#555' }}
                />
                {newComment.trim() && (
                  <IconButton
                    size="small"
                    onClick={handleCreateComment}
                    disabled={createMutation.isPending}
                    sx={{ color: 'primary.main', p: 0.5 }}
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Box key={idx}>
              <Skeleton variant="text" width={220} height={18} />
              <Skeleton variant="text" width="90%" height={20} />
            </Box>
          ))}
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>
          nenhum comentário ainda. seja o primeiro!
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {comments.map((comment) => {
            const isCommentAuthor = user?.id === comment.userId;
            const isProfileOwner = !!profileOwnerUserId && user?.id === profileOwnerUserId;
            const canEdit = isCommentAuthor;
            const canDelete = isCommentAuthor || isProfileOwner;

            return (
              <Box
                key={comment.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  pr: 0.5,
                }}
              >
                {editingCommentId === comment.id ? (
                  <Box sx={{ flex: 1, mt: 1, mb: 2, display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <IconButton
                      size="small"
                      onClick={() => updateMutation.mutate({ commentId: comment.id, comment: editingText })}
                      disabled={!editingText.trim() || updateMutation.isPending}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => setEditingCommentId(null)}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : deletedCommentIds.has(comment.id) ? (
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
                    <CommentComponent
                      comment={{
                        text: comment.text,
                        userId: comment.userId,
                        username: comment.username,
                        displayName: comment.displayName,
                        userProfilePictureUrl: comment.userProfilePictureUrl || '',
                        userProfileUpdatedAt: comment.userProfileUpdatedAt || '',
                        createdAt: comment.createdAt,
                      }}
                    />
                    {editingCommentId !== comment.id && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {canEdit && (
                          <IconButton size="small" onClick={() => startEdit(comment)} sx={{ color: '#bbb', '&:hover': { color: '#666' } }}>
                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                        {canDelete && (
                          <IconButton size="small" onClick={() => deleteMutation.mutate(comment.id)} sx={{ color: '#bbb', '&:hover': { color: 'error.main' } }} disabled={deletedCommentIds.has(comment.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            );
          })}

          {hasNextPage && (
            <Box sx={{ pt: 1 }}>
              <Button
                variant="text"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                sx={{ textTransform: 'none' }}
              >
                {isFetchingNextPage ? 'carregando...' : 'carregar mais'}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProfileCommentsPanel;
