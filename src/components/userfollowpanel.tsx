import React from 'react';
import { Avatar, Box, Button, Skeleton, Typography } from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { publicUrl } from '../utils/imageUtils';

interface FollowUser {
  userId: string;
  username: string;
  displayName: string;
  profilePictureUrl?: string;
  profilePictureUpdatedAt?: string;
  followedAt: string;
  followerCount: number;
}

interface UserFollowPanelProps {
  userId: string;
  type: 'followers' | 'following';
}

const UserFollowPanel: React.FC<UserFollowPanelProps> = ({ userId, type }) => {
  const navigate = useNavigate();

  const endpoint = type === 'followers' ? 'UserFollow/followers' : 'UserFollow/following';
  const dataKey = type === 'followers' ? 'followers' : 'following';

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['userFollow', type, userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(endpoint, {
        params: { userId, pageNumber: pageParam, pageSize: 12 },
      });
      return response.data.data[dataKey];
    },
    enabled: !!userId,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
  });

  const users: FollowUser[] = data?.pages.flatMap((page: any) => page.items) ?? [];

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)', p: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: 'repeat(6, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="circular" width={90} height={90} />
              <Skeleton variant="text" width={70} height={16} />
              <Skeleton variant="text" width={50} height={14} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)', p: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <PeopleOutlineIcon sx={{ fontSize: 48, color: '#ddd', mb: 1 }} />
        <Typography variant="body2" sx={{ color: '#999' }}>
          {type === 'followers' ? 'nenhum seguidor ainda.' : 'não está seguindo ninguém ainda.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)', p: { xs: 2.5, md: 3 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: { xs: 2, sm: 3 },
        }}
      >
        {users.map((u) => {
          const avatarSrc = u.profilePictureUrl
            ? `${u.profilePictureUrl}?t=${u.profilePictureUpdatedAt ?? ''}`
            : publicUrl('/jamcoredefaultpicture.jpg');

          return (
            <Box
              key={u.userId}
              onClick={() => navigate(`/user/${u.userId}`)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                borderRadius: '12px',
                p: 1,
                transition: 'background 0.15s',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
              }}
            >
              <Avatar
                variant="circular"
                src={avatarSrc}
                alt={u.displayName || u.username}
                sx={{
                  width: { xs: 72, sm: 90 },
                  height: { xs: 72, sm: 90 },
                  border: '2px solid rgba(0,0,0,0.06)',
                  flexShrink: 0,
                  borderRadius: '50%',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#111',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  lineHeight: 1.3,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  px: 0.5,
                }}
              >
                {u.displayName || u.username}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <PeopleOutlineIcon sx={{ fontSize: 12, color: '#aaa' }} />
                <Typography variant="caption" sx={{ color: '#888', fontSize: '0.72rem' }}>
                  {u.followerCount} {u.followerCount === 1 ? 'seguidor' : 'seguidores'}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {hasNextPage && (
        <Box sx={{ pt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="text"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            sx={{ textTransform: 'none', color: '#666' }}
          >
            {isFetchingNextPage ? 'carregando...' : 'carregar mais'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UserFollowPanel;
