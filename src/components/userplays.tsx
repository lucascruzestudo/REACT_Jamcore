import React from "react";
import { Typography, Box } from "@mui/material";
import { useQuery } from '@tanstack/react-query';
import api from "../services/api";
import Loader from "../components/loader";
import CompactTrack from "./compacttrack";

interface Track {
  id: string;
  title: string;
  userId: string;
  username: string;
  createdAt: string;
  playedAt?: string;
  imageUrl: string;
  audioFileUrl: string;
  tags: string[];
  likeCount: number;
  playCount: number;
  userLikedTrack: boolean;
  originalDuration: string;
  updatedAt: string;
}

interface RecentTracksProps {
  userId: string;
}

const RecentTracks: React.FC<RecentTracksProps> = ({ userId }) => {
  const { data, isLoading, isError, error } = useQuery<{
    tracks: Track[];
  }>({
    queryKey: ['recentTracks', userId],
    refetchInterval: 500,
    queryFn: async () => {
      const response = await api.get('/TrackPlay/byUser', {
        params: {
          userId,
          pageNumber: 1,
          pageSize: 3,
        },
      });
      const tracks = response.data.data.tracks.items;
      return { tracks };
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Typography variant="h6" color="error">
        erro ao carregar tracks recentes: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      {data?.tracks.length === 0 ? (
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          nenhuma jam escutada recentemente.
        </Typography>
      ) : (
        data?.tracks.map((track) => (
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
            originalDuration={track.originalDuration}
            updatedAt={track.updatedAt}
          />
        ))
      )}
    </Box>
  );
};

export default RecentTracks;