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
    playWithContext: (track: Track, playlist: Track[], index: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    addToQueue: (track: Track) => void;
    addAfterCurrent: (track: Track) => void;
    playTrackAtIndex: (index: number) => void;
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

    // Plays or toggles a track with explicit playlist context.
    // If the track is already playing and the incoming playlist is solo (just that track),
    // the existing playlist is preserved — only toggle play/pause.
    // If the incoming playlist has more than one track, or the track is different, the
    // playlist is always replaced so the queue reflects the correct origin.
    const playWithContext = (newTrack: Track, playlist: Track[], index: number) => {
        if (!audioRef.current) return;

        if (currentTrack?.id === newTrack.id) {
            // Same track already loaded — decide whether to replace the playlist.
            const isSoloContext = playlist.length === 1 && playlist[0].id === newTrack.id;
            if (!isSoloContext) {
                // Caller has a real multi-track playlist: replace context.
                playlistRef.current = playlist;
                playlistIndexRef.current = index;
                setPlaylistState(playlist);
                setPlaylistIndex(index);
            }
            // Otherwise keep the existing playlist and just toggle.
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(console.error);
                setIsPlaying(true);
            }
        } else {
            // Different track: always install the new playlist context before starting.
            playlistRef.current = playlist;
            playlistIndexRef.current = index;
            setPlaylistState(playlist);
            setPlaylistIndex(index);
            _startTrack(newTrack);
        }
    };

    // Simple play/pause toggle for the current track (footer controls).
    // Does not modify the playlist.
    const togglePlayPause = (newTrack: Track) => {
        if (!audioRef.current) return;

        if (!currentTrack || currentTrack.id !== newTrack.id) {
            // Fallback solo playlist for components that bypass playWithContext
            playlistRef.current = [newTrack];
            playlistIndexRef.current = 0;
            setPlaylistState([newTrack]);
            setPlaylistIndex(0);
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

    const addToQueue = (track: Track) => {
        if (playlistRef.current.length === 0) {
            // Nothing queued yet — start playing immediately as a single-track playlist
            playlistRef.current = [track];
            playlistIndexRef.current = 0;
            setPlaylistState([track]);
            setPlaylistIndex(0);
            _startTrack(track);
        } else {
            const newPlaylist = [...playlistRef.current, track];
            playlistRef.current = newPlaylist;
            setPlaylistState(newPlaylist);
        }
    };

    const addAfterCurrent = (track: Track) => {
        if (playlistRef.current.length === 0) {
            playlistRef.current = [track];
            playlistIndexRef.current = 0;
            setPlaylistState([track]);
            setPlaylistIndex(0);
            _startTrack(track);
        } else {
            const idx = playlistIndexRef.current;
            const newPlaylist = [
                ...playlistRef.current.slice(0, idx + 1),
                track,
                ...playlistRef.current.slice(idx + 1),
            ];
            playlistRef.current = newPlaylist;
            setPlaylistState(newPlaylist);
        }
    };

    const playTrackAtIndex = (index: number) => {
        if (index < 0 || index >= playlistRef.current.length) return;
        playlistIndexRef.current = index;
        setPlaylistIndex(index);
        _startTrack(playlistRef.current[index]);
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

    // ── Media Session API ─────────────────────────────────────────────────────
    // Updates the OS/browser media overlay (iOS lock screen, Android notification,
    // Windows / macOS media center) whenever the active track changes.
    useEffect(() => {
        if (!('mediaSession' in navigator) || !currentTrack) return;

        // imageUrl is an absolute Supabase URL; pass it directly as artwork.
        const artworkUrl = currentTrack.imageUrl || '';
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.username,
            album: 'Jamcore',
            artwork: artworkUrl
                ? [
                      { src: artworkUrl, sizes: '96x96',   type: 'image/jpeg' },
                      { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
                      { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
                      { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
                      { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
                      { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
                  ]
                : [],
        });
    }, [currentTrack]);

    // Sync playback state so the overlay shows the correct play/pause icon.
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    // Keep the lock-screen progress bar in sync.
    useEffect(() => {
        if (!('mediaSession' in navigator) || !duration) return;
        try {
            navigator.mediaSession.setPositionState({
                duration,
                playbackRate: audioRef.current?.playbackRate ?? 1,
                position: Math.min(currentTime, duration),
            });
        } catch {
            // setPositionState is not supported on all browsers — fail silently.
        }
    }, [currentTime, duration]);

    // Register hardware/OS media-key handlers once on mount.
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            audioRef.current?.play().catch(console.error);
            setIsPlaying(true);
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            audioRef.current?.pause();
            setIsPlaying(false);
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            const nextIndex = playlistIndexRef.current + 1;
            if (nextIndex < playlistRef.current.length) {
                playlistIndexRef.current = nextIndex;
                setPlaylistIndex(nextIndex);
                _startTrack(playlistRef.current[nextIndex]);
            }
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (audioRef.current && audioRef.current.currentTime > 3) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
            } else {
                const prevIndex = playlistIndexRef.current - 1;
                if (prevIndex >= 0) {
                    playlistIndexRef.current = prevIndex;
                    setPlaylistIndex(prevIndex);
                    _startTrack(playlistRef.current[prevIndex]);
                } else if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentTime(0);
                }
            }
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined && audioRef.current) {
                audioRef.current.currentTime = details.seekTime;
                setCurrentTime(details.seekTime);
            }
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            if (audioRef.current) {
                const skip = details.seekOffset ?? 10;
                audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skip);
                setCurrentTime(audioRef.current.currentTime);
            }
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            if (audioRef.current) {
                const skip = details.seekOffset ?? 10;
                const next = Math.min(audioRef.current.duration || Infinity, audioRef.current.currentTime + skip);
                audioRef.current.currentTime = next;
                setCurrentTime(next);
            }
        });

        return () => {
            (
                ['play', 'pause', 'nexttrack', 'previoustrack', 'seekto', 'seekbackward', 'seekforward'] as MediaSessionAction[]
            ).forEach((action) => {
                try { navigator.mediaSession.setActionHandler(action, null); } catch { /* unsupported */ }
            });
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <TrackContext.Provider value={{ isPlaying, currentTime, duration, volume, currentTrack, togglePlayPause, playWithContext, updateTime, setCurrentTime, setVolume, setIsPlaying, setCurrentTrack, audioRef, playlist, playlistIndex, setPlaylist, playNext, playPrevious, addToQueue, addAfterCurrent, playTrackAtIndex }}>
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