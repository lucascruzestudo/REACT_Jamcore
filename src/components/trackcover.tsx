import React, { useState } from 'react';
import { Box, Typography, IconButton, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackCoverProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
}

const TrackCover: React.FC<TrackCoverProps> = ({ open, onClose, imageUrl, title }) => {
    const [loaded, setLoaded] = useState(false);

    // Reset loaded state whenever a new image is shown
    React.useEffect(() => { if (open) setLoaded(false); }, [open, imageUrl]);

    const handleBackdropClick = (event: React.MouseEvent) => {
        // Prevent the click from "falling through" to elements behind the overlay.
        event.stopPropagation();
        event.preventDefault();

        // Defer closing so the browser finishes processing this click event
        // before the overlay is removed from the DOM.
        window.setTimeout(() => onClose(), 0);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="trackcover-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(10, 10, 10, 0.78)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        padding: '24px',
                    }}
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        key="trackcover-card"
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 12 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                        style={{ width: '100%', maxWidth: 520 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Box
                            sx={{
                                backgroundColor: '#fff',
                                borderRadius: '16px',
                                border: '1px solid rgba(0,0,0,0.07)',
                                boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700, color: '#111', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 40px)' }}
                                >
                                    {title}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={onClose}
                                    sx={{ color: '#aaa', '&:hover': { color: '#333', backgroundColor: 'rgba(0,0,0,0.06)' }, p: '4px', ml: 1, flexShrink: 0 }}
                                >
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>

                            {/* Image area */}
                            <Box sx={{ p: 1.5 }}>
                                <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '10px', overflow: 'hidden', bgcolor: '#F0F0F0' }}>
                                    {!loaded && (
                                        <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'none' }} />
                                    )}
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        onLoad={() => setLoaded(true)}
                                        style={{
                                            display: loaded ? 'block' : 'none',
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TrackCover;
