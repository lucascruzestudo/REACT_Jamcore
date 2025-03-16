import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AlertCard from '../components/alertcard';
import styles from '../styles';
import { Box, Typography } from '@mui/material';

const ConfirmAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const confirmAccount = async () => {
            try {
                const response = await api.get(`Authentication/Confirm/${token}`);
                if (response.status === 200) {
                    setSuccessMessage('conta confirmada com sucesso, redirecionando para o login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 5000);
                } else {
                    navigate('/login');
                    setErrorMessage('falha ao confirmar a conta, verifique o token informado.');
                }
            } catch (error) {
                navigate('/login');
                setErrorMessage('falha ao confirmar a conta, verifique o token informado.');
            }
        };

        confirmAccount();
    }, [token, navigate]);

    return (
        <Box sx={styles.root}>
            <img src="/jamcorelogored.png" alt="Logo" style={styles.logo as React.CSSProperties} />

            {successMessage && <AlertCard message={successMessage} type="success" />}
            {errorMessage && <AlertCard message={errorMessage} type="error" />}

            {!successMessage && !errorMessage && (
                <Typography variant="body1" align="center" sx={{ marginTop: '20px' }}>
                    confirmando sua conta...
                </Typography>
            )}
        </Box>
    );
};

export default ConfirmAccount;