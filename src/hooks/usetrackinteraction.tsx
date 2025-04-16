import { useEffect } from 'react';
import { useTrackInteractionContext } from '../contexts/trackinteractioncontext';

interface TrackInteractionProps {
  trackId: string;
  initialLikeCount: number;
  initialPlayCount: number;
  initialUserLiked: boolean;
}

interface TrackInteraction {
  localLikeCount: number;
  localPlayCount: number;
  userLiked: boolean;
  hasPlayed: boolean;
  toggleLike: () => Promise<void>;
  incrementPlay: () => void;
}

export const useTrackInteraction = ({
  trackId,
  initialLikeCount,
  initialPlayCount,
  initialUserLiked,
}: TrackInteractionProps): TrackInteraction => {
  const { getTrackInteraction, toggleLike, incrementPlay, updateTrackInteraction } =
    useTrackInteractionContext();

  // Inicializa o estado da faixa no contexto apenas se ainda não estiver presente
  useEffect(() => {
    const interaction = getTrackInteraction(trackId);
    if (interaction.likeCount === 0 && interaction.playCount === 0 && !interaction.userLiked) {
      updateTrackInteraction(trackId, {
        likeCount: initialLikeCount,
        playCount: initialPlayCount,
        userLiked: initialUserLiked,
        hasPlayed: false,
      });
    }
  }, [
    trackId,
    initialLikeCount,
    initialPlayCount,
    initialUserLiked,
    getTrackInteraction,
    updateTrackInteraction,
  ]);

  const interaction = getTrackInteraction(trackId);

  return {
    localLikeCount: interaction.likeCount,
    localPlayCount: interaction.playCount,
    userLiked: interaction.userLiked,
    hasPlayed: interaction.hasPlayed,
    toggleLike: () => toggleLike(trackId),
    incrementPlay: () => incrementPlay(trackId),
  };
};