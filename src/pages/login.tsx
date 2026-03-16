import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Button, IconButton, InputAdornment, TextField, Typography, Box, Link, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AlertCard from '../components/alertcard'

const Login = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ username: string; password: string }>({ username: '', password: '' })
  const [loginError, setLoginError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setErrors({ username: '', password: '' })
    setLoginError('')

    if (!username) setErrors((prev) => ({ ...prev, username: 'informe seu nome de usuário' }))
    if (!password) setErrors((prev) => ({ ...prev, password: 'informe sua senha' }))
    if (!username || !password) return

    setLoading(true)
    const success = await login(username, password)
    setLoading(false)

    if (success) {
      setSuccessMessage('autenticado com sucesso, vamos lá!')
      setTimeout(() => navigate('/feed'), 2000)
    } else {
      setLoginError('opa, o login falhou... verifique suas credenciais.')
    }
  }

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
            gap: 0,
          }}
        >
          <img src="/jamcorelogored.png" alt="jamcore" style={{ width: '130px', marginBottom: '8px' }} />

          <Typography variant="body2" sx={{ color: '#999', mb: 3, textAlign: 'center' }}>
            sua plataforma de jams
          </Typography>

          {loginError && <AlertCard message={loginError} type="error" />}
          {successMessage && <AlertCard message={successMessage} type="success" />}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <TextField
              fullWidth
              label="nome de usuário"
              variant="outlined"
              size="small"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              error={!!errors.username}
              helperText={errors.username}
              autoComplete="username"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FAFAFA' } }}
            />
            <TextField
              fullWidth
              label="senha"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              error={!!errors.password}
              helperText={errors.password}
              autoComplete="current-password"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FAFAFA' } }}
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

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Link component={RouterLink} to="/password-recovery" variant="caption" color="primary" underline="hover">
              esqueci minha senha
            </Link>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.4,
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'entrando...' : 'entrar'}
          </Button>

          <Divider sx={{ width: '100%', my: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

          <Typography variant="body2" sx={{ color: '#666' }}>
            não possui conta?{' '}
            <Link component={RouterLink} to="/register" color="primary" underline="hover" fontWeight={600}>
              inscrever-se
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  )
}

export default Login
