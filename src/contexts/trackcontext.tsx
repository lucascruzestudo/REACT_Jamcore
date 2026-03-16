import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../services/api';

export interface Track {
    id: string;
    title: string;
    tags: string[];
    audioFileUrl: string;
    imageUrl: string;
    username: string;
    userId: string;
    createdAt: string;
    likeCount: number;
    playCount: number;
    userLikedTrack: boolean;
    originalDuration: string;
    updatedAt: string;
}

interface TrackContextType {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    togglePlayPause: (track: Track) => void;
    updateTime: (newTime: number) => void;
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    currentTrack: Track | null;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    playlist: Track[];
    playlistIndex: number;
    setPlaylist: (tracks: Track[], index: number) => void;
    playNext: () => void;
    playPrevious: () => void;
}

const TrackContext = createContext<TrackContextType | undefined>(undefined);

export const TrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [playlist, setPlaylistState] = useState<Track[]>([]);
    const [playlistIndex, setPlaylistIndex] = useState(-1);
    const playlistRef = useRef<Track[]>([]);
    const playlistIndexRef = useRef(-1);

    const setPlaylist = (tracks: Track[], index: number) => {
        playlistRef.current = tracks;
        playlistIndexRef.current = index;
        setPlaylistState(tracks);
        setPlaylistIndex(index);
    };

    // Starts a track fresh (does not toggle — always plays from beginning)
    const _startTrack = (track: Track) => {
        if (!audioRef.current) return;
        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        audioRef.current.src = track.audioFileUrl;
        audioRef.current.load();
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error('Erro ao reproduzir:', e));
        setIsPlaying(true);
        api.post('/TrackPlay', { trackId: track.id }).catch(e => console.error('Erro ao registrar play:', e));
    };

    const togglePlayPause = (newTrack: Track) => {
        if (!audioRef.current) return;

        if (!currentTrack || currentTrack.id !== newTrack.id) {
            _startTrack(newTrack);
        } else {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const updateTime = (newTime: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const playNext = () => {
        const nextIndex = playlistIndexRef.current + 1;
        if (nextIndex < playlistRef.current.length) {
            playlistIndexRef.current = nextIndex;
            setPlaylistIndex(nextIndex);
            _startTrack(playlistRef.current[nextIndex]);
        }
    };

    const playPrevious = () => {
        // If more than 3s into the current track, restart it
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            if (!isPlaying) {
                audioRef.current.play().catch(console.error);
                setIsPlaying(true);
            }
            return;
        }
        const prevIndex = playlistIndexRef.current - 1;
        if (prevIndex >= 0) {
            playlistIndexRef.current = prevIndex;
            setPlaylistIndex(prevIndex);
            _startTrack(playlistRef.current[prevIndex]);
        } else {
            // Already at the first track — just restart it
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
                if (!isPlaying) {
                    audioRef.current.play().catch(console.error);
                    setIsPlaying(true);
                }
            }
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleMetadata = () => setDuration(audio.duration);
            const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
            const handleEnded = () => {
                // Auto-advance to the next track in the playlist when available
                const nextIndex = playlistIndexRef.current + 1;
                if (nextIndex < playlistRef.current.length) {
                    const nextTrack = playlistRef.current[nextIndex];
                    playlistIndexRef.current = nextIndex;
                    setPlaylistIndex(nextIndex);
                    setCurrentTrack(nextTrack);
                    setCurrentTime(0);
                    setDuration(0);
                    audio.src = nextTrack.audioFileUrl;
                    audio.load();
                    audio.currentTime = 0;
                    audio.play().catch(e => console.error('Erro ao autoplay:', e));
                    setIsPlaying(true);
                    api.post('/TrackPlay', { trackId: nextTrack.id }).catch(console.error);
                } else {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }
            };

            audio.addEventListener('loadedmetadata', handleMetadata);
            audio.addEventListener('timeupdate', handleTimeUpdate);
            audio.addEventListener('ended', handleEnded);

            return () => {
                audio.removeEventListener('loadedmetadata', handleMetadata);
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('ended', handleEnded);
            };
        }
    }, []);

    useEffect(() => {
        if (location.pathname !== '/login') {
            const handleSpaceKeyPress = (event: KeyboardEvent) => {
                const isInputFocused = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;

                if (event.code === 'Space' && !isInputFocused) {
                    if (audioRef.current) {
                        if (isPlaying) {
                            audioRef.current.pause();
                        } else {
                            audioRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                    }
                }
            };

            window.addEventListener('keydown', handleSpaceKeyPress);

            return () => {
                window.removeEventListener('keydown', handleSpaceKeyPress);
            };
        }
    }, [isPlaying, location.pathname]);

    useEffect(() => {
        if (audioRef.current && !isPlaying) {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    return (
        <TrackContext.Provider value={{ isPlaying, currentTime, duration, volume, currentTrack, togglePlayPause, updateTime, setCurrentTime, setVolume, setIsPlaying, setCurrentTrack, audioRef, playlist, playlistIndex, setPlaylist, playNext, playPrevious }}>
            {children}
            <audio ref={audioRef} />
        </TrackContext.Provider>
    );
};

export const useTrack = (): TrackContextType => {
    const context = useContext(TrackContext);
    if (!context) {
        throw new Error('useTrack must be used within a TrackProvider');
    }
    return context;
};