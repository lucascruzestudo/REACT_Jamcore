import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/auth';

interface TrackInteractionState {
  likeCount: number;
  playCount: number;
  userLiked: boolean;
  hasPlayed: boolean;
}

interface TrackInteractionContextData {
  getTrackInteraction: (trackId: string) => TrackInteractionState;
  hasInteraction: (trackId: string) => boolean;
  toggleLike: (trackId: string) => Promise<void>;
  incrementPlay: (trackId: string) => void;
  updateTrackInteraction: (trackId: string, data: Partial<TrackInteractionState>) => void;
  interactionVersion: number;
}

const TrackInteractionContext = createContext<TrackInteractionContextData>(
  {} as TrackInteractionContextData
);

export const TrackInteractionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [interactions, setInteractions] = useState<{
    [trackId: string]: TrackInteractionState;
  }>({});
  const [interactionVersion, setInteractionVersion] = useState(0);

  // Limpa todas as interações em cache quando o usuário muda (login/logout/troca de conta)
  useEffect(() => {
    setInteractions({});
    setInteractionVersion(0);
  }, [userId]);

  const getTrackInteraction = useCallback(
    (trackId: string): TrackInteractionState => {
      return (
        interactions[trackId] || {
          likeCount: 0,
          playCount: 0,
          userLiked: false,
          hasPlayed: false,
        }
      );
    },
    [interactions]
  );

  const toggleLike = useCallback(
    async (trackId: string) => {
      try {
        await api.put('/TrackLike', { trackId });
        setInteractions((prev) => {
          const current = prev[trackId] || {
            likeCount: 0,
            playCount: 0,
            userLiked: false,
            hasPlayed: false,
          };
          return {
            ...prev,
            [trackId]: {
              ...current,
              userLiked: !current.userLiked,
              likeCount: current.userLiked ? current.likeCount - 1 : current.likeCount + 1,
            },
          };
        });
        setInteractionVersion((v) => v + 1);
        queryClient.invalidateQueries({ queryKey: ['recentLikes', userId] });
      } catch (error) {
        console.error('Error liking/unliking track:', error);
      }
    },
    [queryClient, userId]
  );

  const incrementPlay = useCallback(
    (trackId: string) => {
      setInteractions((prev) => {
        const current = prev[trackId] || {
          likeCount: 0,
          playCount: 0,
          userLiked: false,
          hasPlayed: false,
        };
        if (current.hasPlayed) return prev;
        setInteractionVersion((v) => v + 1);
        queryClient.invalidateQueries({ queryKey: ['recentPlays', userId] });
        return {
          ...prev,
          [trackId]: {
            ...current,
            playCount: current.playCount + 1,
            hasPlayed: true,
          },
        };
      });
    },
    [queryClient, userId]
  );

  const updateTrackInteraction = useCallback(
    (trackId: string, data: Partial<TrackInteractionState>) => {
      setInteractions((prev) => {
        const current = prev[trackId] || {
          likeCount: 0,
          playCount: 0,
          userLiked: false,
          hasPlayed: false,
        };
        // Evita atualizações desnecessárias
        if (
          data.likeCount === current.likeCount &&
          data.playCount === current.playCount &&
          data.userLiked === current.userLiked &&
          data.hasPlayed === current.hasPlayed
        ) {
          return prev;
        }
        return {
          ...prev,
          [trackId]: { ...current, ...data },
        };
      });
    },
    []
  );

  const hasInteraction = useCallback(
    (trackId: string) => trackId in interactions,
    [interactions]
  );

  return (
    <TrackInteractionContext.Provider
      value={{ getTrackInteraction, hasInteraction, toggleLike, incrementPlay, updateTrackInteraction, interactionVersion }}
    >
      {children}
    </TrackInteractionContext.Provider>
  );
};

export const useTrackInteractionContext = () => {
  const context = useContext(TrackInteractionContext);
  if (!context) {
    throw new Error(
      'useTrackInteractionContext must be used within a TrackInteractionProvider'
    );
  }
  return context;
};