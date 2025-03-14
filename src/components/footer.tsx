import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Slider, Avatar, Divider } from '@mui/material';
import { useTrack } from '../contexts/trackcontext';
import { PlayArrow, Pause, SkipPrevious, SkipNext, VolumeUp } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
    const navigate = useNavigate();
    const { currentTrack, isPlaying, currentTime, duration, togglePlayPause, updateTime, setIsPlaying, setVolume, volume } = useTrack();
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const volumeSliderRef = useRef<HTMLDivElement>(null);

    const handlePlayPause = () => {
        if (currentTrack) {
            togglePlayPause(currentTrack);
        }
    };

    const handleTimeChange = (_event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            updateTime(newValue);
        }
    };

    const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            setVolume(newValue);
        }
    };

    const handleSkipPrevious = () => {
        if (currentTrack) {
            updateTime(0);
            setIsPlaying(true);
        }
    };

    const handleSkipNext = () => {
        // Implement skip next functionality
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (volumeSliderRef.current && !volumeSliderRef.current.contains(event.target as Node)) {
            setShowVolumeSlider(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!currentTrack) {
        return null;
    }

    return (
        <Box
            sx={{
                width: '100%',
                padding: '4px',
                position: 'fixed',
                bottom: 0,
                left: 0,
                backgroundColor: '#F2F2F2',
                color: 'primary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'auto',
                borderTop: '1px solid #ccc',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '1000px',
                    gap: 2,
                    padding: '0 16px',
                }}
            >

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flex: 1,
                        justifyContent: 'center',
                    }}
                >
                    <Button
                        onClick={handleSkipPrevious}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: '8px' }}
                    >
                        <SkipPrevious sx={{ fontSize: '1.1rem' }} />
                    </Button>
                    <Button
                        onClick={handlePlayPause}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: '8px' }}
                    >
                        {isPlaying ? (
                            <Pause sx={{ fontSize: '1.1rem' }} />
                        ) : (
                            <PlayArrow sx={{ fontSize: '1.1rem' }} />
                        )}
                    </Button>
                    <Button
                        onClick={handleSkipNext}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: '8px' }}
                    >
                        <SkipNext sx={{ fontSize: '1.1rem' }} />
                    </Button>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={duration}
                        step={0.1}
                        onChange={handleTimeChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${Math.floor(value / 60)}:${Math.floor(value % 60)}`}
                        sx={{ width: '200px', marginRight: 1, '& .MuiSlider-thumb': { display: 'none' } }}
                        size="small"
                    />
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontSize: '0.65rem', minWidth: '80px', textAlign: 'center' }}
                    >
                        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /{' '}
                        {currentTrack.originalDuration}
                    </Typography>

                    <Box
                        sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                        ref={volumeSliderRef}
                    >
                        <Button
                            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                            variant="text"
                            color="secondary"
                            sx={{ minWidth: 'auto', padding: '8px' }}
                        >
                            <VolumeUp sx={{ fontSize: '1.1rem' }} />
                        </Button>
                        <AnimatePresence>
                            {showVolumeSlider && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: '5%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: '#eee',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        paddingTop: '12px',
                                    }}
                                >
                                    <Slider
                                        orientation="vertical"
                                        defaultValue={volume}
                                        max={1}
                                        step={0.01}
                                        aria-labelledby="vertical-slider"
                                        onChange={handleVolumeChange}
                                        size="small"
                                        color="secondary"
                                        sx={{
                                            height: '100px',
                                            '& .MuiSlider-thumb': {
                                                width: 8,
                                                height: 8,
                                            },
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1}} />

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Avatar
                            src={currentTrack.imageUrl}
                            alt={currentTrack.title}
                            sx={{ width: 40, height: 40, borderRadius: '2px', flexShrink: 0, border: '1px solid #ccc'}}
                        />
                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{
                                    fontSize: '0.65rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {currentTrack.username}
                            </Typography>
                            <Typography
                                variant="h6"
                                onClick={() => navigate(`/track/${currentTrack.id}`)}
                                sx={{
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer',
                                }}
                            >
                                {currentTrack.title}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;