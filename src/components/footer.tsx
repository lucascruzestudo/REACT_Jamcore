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
                
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        flexShrink: 0,
                        gap: { xs: 0.5, sm: 1 },
                    }}
                >
                    <Button
                        onClick={handleSkipPrevious}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: { xs: '6px', sm: '8px' } }}
                    >
                        <SkipPrevious sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} /> 
                    </Button>
                    <Button
                        onClick={handlePlayPause}
                        variant="text"
                        color="secondary"
                        sx={{ minWidth: 'auto', padding: { xs: '6px', sm: '8px' } }}
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
                        sx={{ minWidth: 'auto', padding: { xs: '6px', sm: '8px' } }}
                    >
                        <SkipNext sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} /> 
                    </Button>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={duration}
                        step={0.1}
                        onChange={handleTimeChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${Math.floor(value / 60)}:${Math.floor(value % 60)}`}
                        sx={{ width: { xs: '120px', sm: '200px' }, marginRight: 1 }}
                        size="small"
                    />
                    
                    <Box sx={{ width: '80px', textAlign: 'center' }}> 
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ fontSize: { xs: '0.55rem', sm: '0.65rem' } }}
                        >
                            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /{' '}
                            {currentTrack.originalDuration}
                        </Typography>
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ height: '100%', mx: { xs: 0, sm: 8 } }} />

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
                        sx={{ width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 }, borderRadius: '2px', flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                                fontSize: { xs: '0.55rem', sm: '0.65rem' },
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
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
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