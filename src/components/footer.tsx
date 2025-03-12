import React from 'react';
import { Box, Button, Typography, Slider, Avatar, Divider } from '@mui/material';
import { useTrack } from '../contexts/trackcontext';
import { PlayArrow, Pause, SkipPrevious, SkipNext } from '@mui/icons-material';

const Footer: React.FC = () => {
    const { currentTrack, isPlaying, currentTime, duration, togglePlayPause, updateTime, setIsPlaying } = useTrack();

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

    const handleSkipPrevious = () => {
        if (currentTrack) {
            updateTime(0);
            setIsPlaying(true);
        }
    };

    const handleSkipNext = () => {
        // Implement skip next functionality
    };

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
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '1000px',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 },
                }}
            >
                {/* First Row: Controls and Slider */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        flexShrink: 0,
                        gap: { xs: 0.5, sm: 1 }, // Reduce gap on small screens
                    }}
                >
                    <Button
                        onClick={handleSkipPrevious}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: { xs: '6px', sm: '8px' } }} // Reduce padding on small screens
                    >
                        <SkipPrevious sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} /> {/* Reduce icon size on small screens */}
                    </Button>
                    <Button
                        onClick={handlePlayPause}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: { xs: '6px', sm: '8px' } }} // Reduce padding on small screens
                        onKeyDown={(event) => {
                            if (event.key === ' ') {
                                event.preventDefault();
                            }
                        }}
                    >
                        {isPlaying ? (
                            <Pause sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} /> 
                        ) : (
                            <PlayArrow sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
                        )}

                    </Button>
                    <Button
                        onClick={handleSkipNext}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: { xs: '6px', sm: '8px' } }} // Reduce padding on small screens
                    >
                        <SkipNext sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} /> {/* Reduce icon size on small screens */}
                    </Button>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={duration}
                        step={0.1}
                        onChange={handleTimeChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${Math.floor(value / 60)}:${Math.floor(value % 60)}`}
                        sx={{ width: { xs: '120px', sm: '200px' }, marginRight: 1 }} // Reduce slider width on small screens
                        size="small"
                    />
                    {/* Fixed-width container for duration text */}
                    <Box sx={{ width: '80px', textAlign: 'center' }}> {/* Reduce width on small screens */}
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ fontSize: { xs: '0.55rem', sm: '0.65rem' } }} // Reduce font size on small screens
                        >
                            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /{' '}
                            {currentTrack.originalDuration}
                        </Typography>
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ height: '100%', mx: { xs: 0, sm: 2 } }} />

                {/* Second Row: Avatar and Track Info */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        flexDirection: 'row',
                        gap: 1,
                        mt: { xs: 1, sm: 0 },
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <Avatar
                        src={currentTrack.imageUrl}
                        alt={currentTrack.title}
                        sx={{ width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 }, borderRadius: '2px', flexShrink: 0 }} // Reduce avatar size on small screens
                    />
                    <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                                fontSize: { xs: '0.55rem', sm: '0.65rem' }, // Reduce font size on small screens
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {currentTrack.username}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Reduce font size on small screens
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {currentTrack.title}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;