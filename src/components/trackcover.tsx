import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';

interface TrackCoverProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
}

const TrackCover: React.FC<TrackCoverProps> = ({ open, onClose, imageUrl, title }) => {
    if (!open) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(240, 240, 240, 0.78)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ stiffness: 50, damping: 25 }}
                style={{
                    backgroundColor: 'white',
                    padding: 2,
                    position: 'relative',
                    width: '80%',
                    maxWidth: 600,
                    borderRadius: 4,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 9999,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        padding: { xs: '4px', sm: '8px' },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography
                    variant="h6"
                    sx={{
                        padding: '16px',
                        textAlign: 'left',
                    }}
                >
                    {title}
                </Typography>

                <Divider sx={{ marginBottom: 2 }} />

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: 2,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={title}
                        style={{
                            width: '95%',
                            height: 'auto',
                            objectFit: 'contain',
                            border: '1px solid #ccc',
                        }}
                    />
                </Box>
            </motion.div>
        </motion.div>
    );
};

export default TrackCover;
