import React from "react";
import { Typography, Box } from "@mui/material";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from "../services/api";
import Loader from "../components/loader";

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
    return <Loader />;
  }

  if (isError) {
    return (
      <Typography variant="h6" color="error">
        Erro ao carregar comentários: {error.message}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {data?.comments.length === 0 ? (
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          nenhum comentário.
        </Typography>
      ) : (
        data?.comments.map((comment) => (
          <Box key={comment.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', color: 'text.secondary', textDecoration: 'none' }}
                onClick={() => navigate(`/track/${comment.trackId}`)}
              >
                em{' '}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      fontWeight: 'bold',
                    },
                  }}
                >
                  {comment.trackName}
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatTimeAgo(comment.createdAt)}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              “{comment.text}”
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

export default UserComments;