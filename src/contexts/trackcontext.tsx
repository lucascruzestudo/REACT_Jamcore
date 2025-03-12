import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../services/api';

interface TrackContextType {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    trackUrl: string | null;
    trackId: string | null;
    togglePlayPause: (audioUrl: string, trackId: string) => void;
    updateTime: (newTime: number) => void;
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
}

const TrackContext = createContext<TrackContextType | undefined>(undefined);

export const TrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [trackUrl, setTrackUrl] = useState<string | null>(null);
    const [trackId, setTrackId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const togglePlayPause = (audioUrl: string, trackId: string) => {
        if (!audioRef.current) return;

        if (trackUrl !== audioUrl) {
            setTrackUrl(audioUrl);
            setTrackId(trackId);
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            try {
                audioRef.current.play();
            } catch (error: any) {
            }
            try {
                api.post('/TrackPlay', { trackId: trackId });
            } catch (error) {
                console.error('Error updating play count:', error);
            }
            setIsPlaying(true);
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

            audio.addEventListener('loadedmetadata', handleMetadata);
            audio.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                audio.removeEventListener('loadedmetadata', handleMetadata);
                audio.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, []);

    useEffect(() => {
        const handleSpaceKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
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
    }, [isPlaying]);

    return (
        <TrackContext.Provider value={{ isPlaying, currentTime, duration, trackUrl, trackId, togglePlayPause, updateTime, setCurrentTime }}>
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
