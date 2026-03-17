import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface QueueItemProps {
  id: string;
  title: string;
  imageUrl: string;
  username: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  index: number;
  onSelect: () => void;
  onDragStart?: (from: number) => void;
  onDrop?: (from: number, to: number) => void;
}

const QueueItem: React.FC<QueueItemProps> = ({
  id,
  title,
  imageUrl,
  username,
  userId,
  createdAt,
  updatedAt,
  isActive,
  index,
  onSelect,
  onDragStart,
  onDrop,
}) => {
  const navigate = useNavigate();

  return (
    <Box
      draggable
      onClick={onSelect}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(index));
        onDragStart?.(index);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const from = Number(e.dataTransfer.getData('text/plain'));
        onDrop?.(from, index);
        e.dataTransfer.clearData();
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: '7px',
        borderRadius: '8px',
        backgroundColor: isActive ? 'rgba(233,52,52,0.07)' : 'transparent',
        cursor: 'pointer',
        '&:hover': { backgroundColor: isActive ? 'rgba(233,52,52,0.1)' : 'rgba(0,0,0,0.04)' },
      }}
    >
      <Typography
        sx={{ fontSize: '0.62rem', color: 'rgba(0,0,0,0.3)', minWidth: 16, textAlign: 'right', flexShrink: 0 }}
      >
        {index + 1}
      </Typography>
      <Avatar
        src={`${imageUrl}?t=${updatedAt || createdAt}`}
        alt={title}
        variant="rounded"
        sx={{
          width: 34,
          height: 34,
          borderRadius: '5px',
          flexShrink: 0,
          border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer',
          '&:hover': { opacity: 0.85 },
        }}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/track/${id}`);
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="span"
          noWrap
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/track/${id}`);
          }}
          sx={{
            display: 'block',
            width: 'fit-content',
            fontSize: '0.76rem',
            fontWeight: isActive ? 700 : 500,
            color: isActive ? '#E93434' : '#111',
            lineHeight: 1.3,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {title}
        </Typography>
        <Typography
          component="span"
          noWrap
          onClick={() => navigate(`/user/${userId}`)}
          sx={{
            display: 'block',
            width: 'fit-content',
            fontSize: '0.65rem',
            color: 'rgba(0,0,0,0.5)',
            lineHeight: 1.3,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {username}
        </Typography>
      </Box>
      {isActive && (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#E93434',
            flexShrink: 0,
            boxShadow: '0 0 4px rgba(233,52,52,0.5)',
          }}
        />
      )}
    </Box>
  );
};

export default QueueItem;
