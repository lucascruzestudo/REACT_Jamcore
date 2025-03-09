import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, InputAdornment, TextField, Typography, Box, Link } from '@mui/material'
import { motion } from 'framer-motion'
import styles from '../styles'
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
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setErrors({ username: '', password: '' })
    setLoginError('')
    
    if (!username) {
      setErrors((prev) => ({ ...prev, username: 'informe seu nome de usuário' }))
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'informe sua senha' }))
    }

    if (!username || !password) return

    const success = await login(username, password)
    if (success) {
      setSuccessMessage('autenticado com sucesso, vamos lá!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } else {
      setLoginError('opa, o login falhou... verifique suas credenciais.')
    }
  }

  return (
    <motion.div 
      style={styles.root as React.CSSProperties}
      initial={{ opacity: 1 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
    >
      <img src="https://bgceohesbgirgijwxbhn.supabase.co/storage/v1/object/public/jamcore-static//jamcorelogored.png" alt="Logo" style={styles.logo as React.CSSProperties} />
      <div style={styles.form as React.CSSProperties}>
        {loginError && <AlertCard message={loginError} type="error" />}
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
          label="senha" 
          type={showPassword ? 'text' : 'password'}
          variant="standard"
          sx={styles.textField}
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          error={!!errors.password}
          helperText={errors.password}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
        />
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mt={2}>
          <Button variant="contained" color="primary" onClick={handleLogin}>
            entrar na jam
          </Button>
          <Link href="/password-recovery" variant="body2" color="primary" underline="hover">
            esqueci minha senha
          </Link>
        </Box>

        <Typography variant="body2" sx={{ mt: 4 }}>
          não possui conta? <Link href="/register" color="primary" underline="hover">inscrever-se</Link>
        </Typography>
      </div>
    </motion.div>
  )
}

export default Login
