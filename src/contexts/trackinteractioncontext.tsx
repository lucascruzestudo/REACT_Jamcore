import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

interface TrackInteractionState {
  likeCount: number;
  playCount: number;
  userLiked: boolean;
  hasPlayed: boolean;
}

interface TrackInteractionContextData {
  getTrackInteraction: (trackId: string) => TrackInteractionState;
  toggleLike: (trackId: string) => Promise<void>;
  incrementPlay: (trackId: string) => void;
  updateTrackInteraction: (trackId: string, data: Partial<TrackInteractionState>) => void;
}

const TrackInteractionContext = createContext<TrackInteractionContextData>(
  {} as TrackInteractionContextData
);

export const TrackInteractionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [interactions, setInteractions] = useState<{
    [trackId: string]: TrackInteractionState;
  }>({});

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
      } catch (error) {
        console.error('Error liking/unliking track:', error);
      }
    },
    []
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
    []
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

  return (
    <TrackInteractionContext.Provider
      value={{ getTrackInteraction, toggleLike, incrementPlay, updateTrackInteraction }}
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