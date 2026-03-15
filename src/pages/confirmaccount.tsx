import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Box, Typography, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';

const ConfirmAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const confirmAccount = async () => {
            try {
                const response = await api.get(`Authentication/Confirm/${token}`);
                if (response.status === 200) {
                    setStatus('success');
                    setMessage('conta confirmada com sucesso! redirecionando para o login...');
                    setTimeout(() => navigate('/login'), 4000);
                } else {
                    setStatus('error');
                    setMessage('falha ao confirmar a conta, verifique o token informado.');
                    setTimeout(() => navigate('/login'), 4000);
                }
            } catch {
                setStatus('error');
                setMessage('falha ao confirmar a conta, verifique o token informado.');
                setTimeout(() => navigate('/login'), 4000);
            }
        };
        confirmAccount();
    }, [token, navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#FAFAFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '400px' }}
            >
                <Box
                    sx={{
                        backgroundColor: '#fff',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        px: { xs: 3, sm: 5 },
                        py: { xs: 4, sm: 5 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        textAlign: 'center',
                    }}
                >
                    <img src="/jamcorelogored.png" alt="jamcore" style={{ width: '120px', marginBottom: '8px' }} />

                    {status === 'loading' && (
                        <>
                            <CircularProgress size={36} color="primary" />
                            <Typography variant="body1" sx={{ color: '#666' }}>
                                confirmando sua conta...
                            </Typography>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#2E7D32' }} />
                            <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
                                {message}
                            </Typography>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <ErrorOutlineIcon sx={{ fontSize: 48, color: '#D32F2F' }} />
                            <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
                                {message}
                            </Typography>
                        </>
                    )}
                </Box>
            </motion.div>
        </Box>
    );
};

export default ConfirmAccount;