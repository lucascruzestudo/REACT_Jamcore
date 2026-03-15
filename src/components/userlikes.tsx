import React from "react";
import { Typography, Box } from "@mui/material";
import CompactTrack from "./compacttrack";

interface Track {
  id: string;
  title: string;
  userId: string;
  username: string;
  createdAt: string;
  imageUrl: string;
  audioFileUrl: string;
  tags: string[];
  likeCount: number;
  playCount: number;
  userLikedTrack: boolean;
  duration: string;
  updatedAt: string;
}

interface RecentLikesProps {
  tracks: Track[];
}

const RecentLikes: React.FC<RecentLikesProps> = ({ tracks }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        nenhuma jam curtida recentemente.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {tracks.map((track) => (
        <CompactTrack
          key={track.id}
          id={track.id}
          title={track.title}
          userId={track.userId}
          username={track.username}
          createdAt={track.createdAt}
          imageUrl={track.imageUrl}
          audioFileUrl={track.audioFileUrl}
          tags={track.tags}
          likeCount={track.likeCount}
          playCount={track.playCount}
          userLikedTrack={track.userLikedTrack}
          originalDuration={track.duration}
          updatedAt={track.updatedAt}
        />
      ))}
    </Box>
  );
};

export default RecentLikes;