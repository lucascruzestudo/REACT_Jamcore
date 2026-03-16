import React from "react";
import { Typography, Box } from "@mui/material";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from "../services/api";
import { Skeleton } from '@mui/material';

interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  displayName: string;
  createdAt: string;
  trackId: string;
  trackName: string;
}

interface UserCommentsProps {
  userId: string;
}

const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const commentDate = new Date(date);
  const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

  const intervals = [
    { label: 'ano', seconds: 31536000 },
    { label: 'mês', seconds: 2592000 },
    { label: 'dia', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 },
    { label: 'segundo', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} atrás`;
    }
  }

  return 'agora';
};

const UserComments: React.FC<UserCommentsProps> = ({ userId }) => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery<{
    comments: Comment[];
  }>({
    queryKey: ['userComments', userId],
    queryFn: async () => {
      const response = await api.get('TrackComment/byUser', {
        params: {
          userId,
          pageNumber: 1,
          pageSize: 3,
        },
      });
      const comments = response.data.data.tracks.items;
      return { comments };
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i}>
            <Skeleton variant="text" width={180} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="80%" height={16} />
          </Box>
        ))}
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="h6" color="error">
        Erro ao carregar comentários: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      {data?.comments.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#999', py: 1 }}>
          nenhum comentário recente.
        </Typography>
      ) : (
        data?.comments.map((comment, index) => (
          <Box
            key={comment.id}
            sx={{
              py: 1.5,
              borderTop: index > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: '#888' }}
              >
                em{' '}
                <Box
                  component="span"
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/track/${comment.trackId}`);
                    }
                  }}
                  onClick={() => navigate(`/track/${comment.trackId}`)}
                  sx={{ fontWeight: 600, color: '#555', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                >
                  {comment.trackName}
                </Box>
              </Typography>
              <Typography variant="caption" sx={{ color: '#bbb', flexShrink: 0, ml: 1 }}>
                {formatTimeAgo(comment.createdAt)}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{comment.text}"
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

export default UserComments;