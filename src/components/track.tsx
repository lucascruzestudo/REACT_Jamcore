import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Slider, Button, Divider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import LinkIcon from '@mui/icons-material/Link';
import api from '../services/api'

interface TrackProps {
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
}

const Track: React.FC<TrackProps> = ({
    id,
    imageUrl,
    title,
    audioFileUrl,
    username,
    tags,
    createdAt,
    likeCount,
    playCount,
    userLikedTrack,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [localLikeCount, setLocalLikeCount] = useState(likeCount);
    const [localPlayCount, setLocalPlayCount] = useState(playCount);
    const [userLiked, setUserLiked] = useState(userLikedTrack);
    const [hasPlayed, setHasPlayed] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlayPause = async () => {
        if (audioRef.current) {
            if (!isPlaying) {
                if (!hasPlayed) {
                    try {
                        await api.post('/TrackPlay', { trackId: id });
                        setLocalPlayCount((prevCount) => prevCount + 1);
                        setHasPlayed(true);
                    } catch (error) {
                        console.error('Error updating play count:', error);
                    }
                }
            }

            isPlaying ? audioRef.current.pause() : audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const toggleLike = async () => {
        try {
            await api.put(`/TrackLike`, { trackId: id });
            setUserLiked(!userLiked);
            setLocalLikeCount((prevCount) => (userLiked ? prevCount - 1 : prevCount + 1));
        } catch (error) {
            console.error('Error liking/unliking track:', error);
        }
    };

    const updateTime = (_event: Event, newValue: number | number[]) => {
        if (audioRef.current && typeof newValue === 'number') {
            audioRef.current.currentTime = newValue;
            setCurrentTime(newValue);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
            audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
        }

        return () => {
            if (audio) {
                audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration));
                audio.removeEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
            }
        };
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 600,
                m: '10px auto',
                p: 2,
                border: '2px solid #ccc',
                backgroundColor: 'white',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', sm: 100 },
                        height: { xs: 150, sm: 100 },
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: { xs: 2, sm: 0 },
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        ml: { sm: 2 },
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: { sm: 100 },
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body2" color="textSecondary" noWrap>
                                {username || 'null'}
                            </Typography>
                            <Typography
                                variant="body1"
                                noWrap
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {title || 'null'}
                            </Typography>
                        </Box>
                        <Box textAlign="right">
                            {(() => {
                                const date = new Date(createdAt);
                                const today = new Date();
                                const diffTime = Math.abs(today.getTime() - date.getTime());
                                const diffSeconds = Math.ceil(diffTime / 1000);
                                const diffMinutes = Math.ceil(diffSeconds / 60);
                                const diffHours = Math.ceil(diffMinutes / 60);
                                const diffDays = Math.ceil(diffHours / 24);

                                if (diffSeconds < 60) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{`${diffSeconds} segundos atrás`}</Typography>
                                } else if (diffMinutes < 60) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{`${diffMinutes} minutos atrás`}</Typography>
                                } else if (diffHours < 24) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{`${diffHours} horas atrás`}</Typography>
                                } else if (diffDays < 30) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{`${diffDays} dias atrás`}</Typography>
                                } else if (diffDays < 365) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{`${Math.ceil(diffDays / 30)} meses atrás`}</Typography>
                                } else {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{`${Math.ceil(diffDays / 365)} anos atrás`}</Typography>
                                }
                            })()}
                            <Box
                                sx={{
                                    display: 'inline-block',
                                    ...(tags.length > 1 && { gap: 1 }),
                                }}
                            >
                                <Box
                                    sx={{
                                        backgroundColor: '#eee',
                                        borderRadius: '8px',
                                        padding: '2px 8px',
                                        display: 'inline-block',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    <Typography variant="body2" color="textPrimary" noWrap>
                                        #{tags[0]}
                                    </Typography>
                                </Box>
                                {tags.length > 1 && (
                                    <Box
                                        sx={{
                                            backgroundColor: '#eee',
                                            borderRadius: '8px',
                                            padding: '2px 8px',
                                            display: 'inline-block',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        <Typography variant="body2" color="textPrimary" noWrap>
                                            +{tags.length - 1}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 2,
                        }}
                    >
                        <IconButton onClick={togglePlayPause}>
                            {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        </IconButton>

                        <Slider
                            value={currentTime}
                            min={0}
                            max={duration}
                            onChange={updateTime}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`}
                            sx={{ flex: 1, mx: 1 }}
                        />

                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', pl: 2 }}>
                            {`${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')} / ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: { xs: 1, sm: 2 }
                }}
            >
                <Button
                    startIcon={<PlayArrowIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                    variant="text"
                    color="secondary"
                    size="small"
                    sx={{ minWidth: { xs: '40%', sm: 'auto' }, py: { xs: 1, sm: 0.5 } }}
                >
                    {localPlayCount >= 1000000
                        ? `${(localPlayCount / 1000000).toFixed(1)}m`
                        : localPlayCount >= 1000
                            ? `${(localPlayCount / 1000).toFixed(1)}k`
                            : localPlayCount || 0}
                </Button>
                <Button
                    startIcon={<FavoriteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                    variant="text"
                    color={userLiked ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ minWidth: { xs: '40%', sm: 'auto' }, py: { xs: 1, sm: 0.5 } }}
                    onClick={() => {
                        if (userLikedTrack) {
                            toggleLike()
                        } else {
                            toggleLike()
                        }
                    }}
                >
                    {localLikeCount >= 1000000
                        ? `${(localLikeCount / 1000000).toFixed(1)}m`
                        : localLikeCount >= 1000
                            ? `${(localLikeCount / 1000).toFixed(1)}k`
                            : localLikeCount || 0}
                </Button>
                <Button
                    startIcon={<ShareIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                    variant="text"
                    color="secondary"
                    size="small"
                    sx={{ minWidth: { xs: '100%', sm: 'auto' }, py: { xs: 1, sm: 0.5 } }}
                >
                    compartilhar
                </Button>
                <Button
                    startIcon={<LinkIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                    variant="text"
                    color="secondary"
                    size="small"
                    sx={{ minWidth: { xs: '100%', sm: 'auto' }, py: { xs: 1, sm: 0.5 } }}
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                    copiar link
                </Button>
            </Box>

            <audio ref={audioRef} src={audioFileUrl} />
        </Box>
    );
};

export default Track;
