import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Button, IconButton, InputAdornment, TextField, Typography, Box, Link, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AlertCard from '../components/alertcard';
import api from '../services/api';
import { publicUrl } from '../utils/imageUtils';

const Register = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ username: string; password: string; email: string; confirmPassword: string }>({
        username: '',
        password: '',
        email: '',
        confirmPassword: '',
    });
    const [registerError, setRegisterError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (pw: string): string => {
        if (pw.length < 8) return 'a senha deve ter pelo menos 8 caracteres';
        if (!/[A-Z]/.test(pw)) return 'a senha deve ter pelo menos uma letra maiuscula';
        if (!/[0-9]/.test(pw)) return 'a senha deve ter pelo menos um numero';
        if (!/[\W_]/.test(pw)) return 'a senha deve ter pelo menos um caractere especial';
        return '';
    };

    const handleRegister = async () => {
        setErrors({ username: '', password: '', email: '', confirmPassword: '' });
        setRegisterError('');

        if (!username) setErrors((prev) => ({ ...prev, username: 'informe seu nome de usuario' }));
        if (!email) setErrors((prev) => ({ ...prev, email: 'informe seu e-mail' }));
        if (!password) {
            setErrors((prev) => ({ ...prev, password: 'informe sua senha' }));
        } else {
            const passwordError = validatePassword(password);
            if (passwordError) {
                setErrors((prev) => ({ ...prev, password: passwordError }));
                return;
            }
        }
        if (password !== confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: 'as senhas nao coincidem' }));
        }

        if (!username || !email || !password || password !== confirmPassword) return;

        setLoading(true);

        try {
            const response = await api.post('Authentication/Register',
                { username, password, email },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                setSuccessMessage('cadastro realizado com sucesso, confirme sua conta para logar.');
                setIsRegistered(true);
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setRegisterError('opa, o cadastro falhou... tente novamente.');
            }
        } catch {
            setRegisterError('erro ao tentar registrar, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const fieldSx = {
        '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FAFAFA' },
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#FAFAFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 4,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ width: '100%', maxWidth: '420px' }}
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
                    }}
                >
                    <img src={publicUrl('/jamcorelogored.png')} alt="jamcore" style={{ width: '130px', marginBottom: '8px' }} />

                    <Typography variant="body2" sx={{ color: '#999', mb: 3, textAlign: 'center' }}>
                        crie sua conta gratis
                    </Typography>

                    {registerError && <AlertCard message={registerError} type="error" />}
                    {successMessage && <AlertCard message={successMessage} type="success" />}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        <TextField
                            fullWidth
                            label="nome de usuario"
                            variant="outlined"
                            size="small"
                            sx={fieldSx}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            error={!!errors.username}
                            helperText={errors.username}
                            autoComplete="username"
                        />
                        <TextField
                            fullWidth
                            label="e-mail"
                            variant="outlined"
                            size="small"
                            sx={fieldSx}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            label="senha"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            size="small"
                            sx={fieldSx}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            autoComplete="new-password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} size="small" edge="end">
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="confirmacao de senha"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            size="small"
                            sx={fieldSx}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            autoComplete="new-password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} size="small" edge="end">
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={handleRegister}
                        disabled={loading || isRegistered}
                        sx={{
                            mt: 3,
                            py: 1.4,
                            borderRadius: '10px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                        }}
                    >
                        {loading ? 'criando...' : isRegistered ? 'conta criada' : 'criar conta'}
                    </Button>

                    <Divider sx={{ width: '100%', my: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

                    <Typography variant="body2" sx={{ color: '#666' }}>
                        ja possui uma conta?{' '}
                        <Link component={RouterLink} to="/login" color="primary" underline="hover" fontWeight={600}>
                            faca login
                        </Link>
                    </Typography>
                </Box>
            </motion.div>
        </Box>
    );
};

export default Register;
