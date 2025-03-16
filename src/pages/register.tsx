import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Button, IconButton, InputAdornment, TextField, Typography, Box, Link } from '@mui/material';
import { motion } from 'framer-motion';
import styles from '../styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AlertCard from '../components/alertcard';
import api from '../services/api';

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

    const validatePassword = (password: string): string => {
        if (password.length < 8) return 'a senha deve ter pelo menos 8 caracteres';
        if (!/[A-Z]/.test(password)) return 'a senha deve ter pelo menos uma letra maiúscula';
        if (!/[0-9]/.test(password)) return 'a senha deve ter pelo menos um número';
        if (!/[\W_]/.test(password)) return 'a senha deve ter pelo menos um caractere especial';
        return '';
    };

    const handleRegister = async () => {
        setErrors({ username: '', password: '', email: '', confirmPassword: '' });
        setRegisterError('');

        if (!username) {
            setErrors((prev) => ({ ...prev, username: 'informe seu nome de usuário' }));
        }
        if (!email) {
            setErrors((prev) => ({ ...prev, email: 'informe seu e-mail' }));
        }
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
            setErrors((prev) => ({ ...prev, confirmPassword: 'as senhas não coincidem' }));
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
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setRegisterError('opa, o cadastro falhou... tente novamente.');
            }
        } catch (error) {
            setRegisterError('erro ao tentar registrar, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            style={styles.root as React.CSSProperties}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <img src="/jamcorelogored.png" alt="logo" style={styles.logo as React.CSSProperties} />
            <div style={styles.form as React.CSSProperties}>
                {registerError && <AlertCard message={registerError} type="error" />}
                {successMessage && <AlertCard message={successMessage} type="success" />}
                <TextField
                    fullWidth
                    label="nome de usuário"
                    variant="standard"
                    sx={styles.textField}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={!!errors.username}
                    helperText={errors.username}
                />
                <TextField
                    fullWidth
                    label="e-mail"
                    variant="standard"
                    sx={styles.textField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    fullWidth
                    label="senha"
                    type={showPassword ? 'text' : 'password'}
                    variant="standard"
                    sx={styles.textField}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    fullWidth
                    label="confirmação de senha"
                    type={showPassword ? 'text' : 'password'}
                    variant="standard"
                    sx={styles.textField}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mt={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRegister}
                        disabled={loading || isRegistered}
                    >
                        {loading ? 'criando...' : isRegistered ? 'conta criada' : 'criar conta'}
                    </Button>
                </Box>

                <Typography variant="body2" sx={{ mt: 4 }}>
                    já possui uma conta?{' '}
                    <Link component={RouterLink} to="/login" color="primary" underline="hover">
                        faça login
                    </Link>
                </Typography>
            </div>
        </motion.div>
    );
};

export default Register;
