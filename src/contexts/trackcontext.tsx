import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../services/api';
import Track from '../components/track';

interface Track {
    key: string;
    id: string;
    title: string;
    tags: string[];
    audioFileUrl: string;
    imageUrl: string;
    username: string;
    createdAt: string;
    likeCount: number;
    playCount: number;
    userLikedTrack: boolean;
    originalDuration: string;
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
}

const TrackContext = createContext<TrackContextType | undefined>(undefined);

export const TrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

    const togglePlayPause = (newTrack: Track) => {
        if (!audioRef.current) return;

        if (!currentTrack || currentTrack.id !== newTrack.id) {
            setCurrentTrack(newTrack);
            audioRef.current.src = newTrack.audioFileUrl;
            audioRef.current.load();

            try {
                audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error('Erro ao reproduzir a faixa:', error);
            }

            try {
                api.post('/TrackPlay', { trackId: newTrack.id });
            } catch (error) {
                console.error('Erro ao atualizar contagem de reproduções:', error);
            }
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

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleMetadata = () => setDuration(audio.duration);
            const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
            const handleEnded = () => {
                setIsPlaying(false);
                setCurrentTime(0);
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
        <TrackContext.Provider value={{ isPlaying, currentTime, duration, volume, currentTrack, togglePlayPause, updateTime, setCurrentTime, setVolume, setIsPlaying, setCurrentTrack }}>
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