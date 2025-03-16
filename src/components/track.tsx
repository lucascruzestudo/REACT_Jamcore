import React, { useState } from 'react';
import { Box, Typography, IconButton, Slider, Button, Divider, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import api from '../services/api'
import { useTrack } from '../contexts/trackcontext';
import TrackCover from './trackcover';
import { useNavigate } from 'react-router-dom';

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
    originalDuration: string;
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
    originalDuration
}) => {
    const { isPlaying, currentTime, duration, togglePlayPause, updateTime, currentTrack } = useTrack();
    const [localLikeCount, setLocalLikeCount] = useState(likeCount);
    const [localPlayCount, setLocalPlayCount] = useState(playCount);
    const [userLiked, setUserLiked] = useState(userLikedTrack);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigateToTrack = () => {
        navigate(`/track/${id}`);
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const trackData = {
        key: id,
        id,
        title,
        tags,
        audioFileUrl,
        imageUrl,
        username,
        createdAt,
        likeCount,
        playCount,
        userLikedTrack,
        originalDuration
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

    const updateSliderTime = (_event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            updateTime(newValue);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: { xs: 600, sm: 700 },
                width: { xs: '100%', sm: 700 },
                m: 'auto',
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
                        cursor: 'pointer',
                        border: '1px solid #ccc'
                    }}
                    onClick={handleOpenModal}
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
                            <Tooltip title={title || 'null'} arrow>
                                <Box
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                    onClick={handleNavigateToTrack}
                                >
                                    <Typography
                                        variant="body1"
                                        noWrap
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            wordBreak: 'break-word',
                                            maxWidth: { xs: '26ch', sm: '45ch' },
                                        }}
                                    >
                                        {title || 'null'}
                                    </Typography>
                                </Box>
                            </Tooltip>
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
                                    return <Typography variant="body2" color="textSecondary" noWrap>{diffSeconds === 1 ? `${diffSeconds} segundo atrás` : `${diffSeconds} segundos atrás`}</Typography>
                                } else if (diffMinutes < 60) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{diffMinutes === 1 ? `${diffMinutes} minuto atrás` : `${diffMinutes} minutos atrás`}</Typography>
                                } else if (diffHours < 24) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{diffHours === 1 ? `${diffHours} hora atrás` : `${diffHours} horas atrás`}</Typography>
                                } else if (diffDays < 30) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{diffDays === 1 ? `${diffDays} dia atrás` : `${diffDays} dias atrás`}</Typography>
                                } else if (diffDays < 365) {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{diffDays === 30 ? `${Math.ceil(diffDays / 30)} mês atrás` : `${Math.ceil(diffDays / 30)} meses atrás`}</Typography>
                                } else {
                                    return <Typography variant="body2" color="textSecondary" noWrap>{diffDays === 365 ? `${Math.ceil(diffDays / 365)} ano atrás` : `${Math.ceil(diffDays / 365)} anos atrás`}</Typography>
                                }
                            })()}

                            <Box
                                sx={{
                                    display: 'inline-block',
                                    ...(tags.length > 1 && { gap: 1 }),
                                }}
                            >
                                {tags.length > 0 && (
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
                                )}
                                {tags.length > 1 && (
                                    <Box
                                        sx={{
                                            backgroundColor: '#eee',
                                            borderRadius: '8px',
                                            padding: '2px 8px',
                                            marginLeft: '4px',
                                            display: 'inline-block',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        <Tooltip title={tags.slice(1).join(', ')} arrow>
                                            <Typography variant="body2" color="textPrimary" noWrap>
                                                +{tags.length - 1}
                                            </Typography>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                        <IconButton onKeyDown={(event) => {
                            if (event.key === ' ') {
                                event.preventDefault();
                            }
                        }} onClick={async () => {
                            togglePlayPause(trackData);
                            if (!hasPlayed) {
                                setLocalPlayCount((prevCount) => prevCount + 1);
                                setHasPlayed(true);
                            }
                        }}>
                            {isPlaying && id === currentTrack?.id ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        </IconButton>

                        <Slider
                            value={id === currentTrack?.id ? currentTime : 0}
                            min={0}
                            max={id === currentTrack?.id ? duration : (() => {
                                const timeParts = originalDuration.split(':').map(Number);
                                return timeParts.reduce((acc, part) => acc * 60 + part, 0);
                            })()}
                            onChange={updateSliderTime}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`}
                            sx={{
                                flex: 1, mx: 1, '& .MuiSlider-thumb': {
                                    display: 'none',
                                },
                            }}
                            disabled={id !== currentTrack?.id}
                        />

                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', pl: 2 }}>
                            {id === currentTrack?.id
                                ? `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')} / ${originalDuration}`
                                : `00:00 / ${originalDuration}`
                            }
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'nowrap',
                    width: '100%',
                }}
            >
                <Button
                    startIcon={<PlayArrowIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                    variant="text"
                    color="secondary"
                    size="small"
                    sx={{ py: { xs: 1, sm: 0.5 } }}
                >
                    {localPlayCount >= 1000000
                        ? `${(localPlayCount / 1000000).toFixed(1)}m`
                        : localPlayCount >= 1000
                            ? `${(localPlayCount / 1000).toFixed(1)}k`
                            : localPlayCount || 0}
                </Button>
                <Button
                    startIcon={
                        userLiked ? (
                            <FavoriteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        )
                    }
                    variant="text"
                    color={userLiked ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ py: { xs: 1, sm: 0.5 } }}
                    onClick={() => {
                        toggleLike();
                    }}
                >
                    {localLikeCount >= 1000000
                        ? `${(localLikeCount / 1000000).toFixed(1)}m`
                        : localLikeCount >= 1000
                            ? `${(localLikeCount / 1000).toFixed(1)}k`
                            : localLikeCount || 0}
                </Button>
                <Button
                    startIcon={<LinkIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                    variant="text"
                    color="secondary"
                    size="small"
                    sx={{ py: { xs: 1, sm: 0.5 } }}
                    onClick={() => {
                        const url = window.location.href.split('/').slice(0, 3).join('/') + `/track/${id}`;
                        navigator.clipboard.writeText(url);
                    }}
                >
                    copiar link
                </Button>
            </Box>
            <TrackCover
                open={modalOpen}
                onClose={handleCloseModal}
                imageUrl={imageUrl}
                title={title}
            />
        </Box>

    );
};

export default Track;
