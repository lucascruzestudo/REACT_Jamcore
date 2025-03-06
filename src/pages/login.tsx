
import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, InputAdornment, TextField } from '@mui/material'
import { motion } from 'framer-motion'
import styles from './login.styles'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import toastService from '../services/toastservice'

const Login = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ username: string; password: string }>({ username: '', password: '' })
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setErrors({ username: '', password: '' })
    
    if (!username) {
      setErrors((prev) => ({ ...prev, username: 'Nome de usuário é obrigatório' }))
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Senha é obrigatória' }))
    }

    if (!username || !password) return

    const success = await login(username, password)
    if (success) {
      navigate('/dashboard')
      toastService.success('Login realizado com sucesso!')
    } else {
      toastService.error('Login falhou! Verifique suas credenciais.')
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
        <TextField 
          fullWidth 
          label="Nome de usuário" 
          variant="standard" 
          sx={styles.textField}
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          error={!!errors.username}
          helperText={errors.username}
          FormHelperTextProps={{
            sx: styles.helperText,
          }}
        />
        <TextField 
          fullWidth 
          label="Senha" 
          type={showPassword ? 'text' : 'password'}
          variant="standard"
          sx={styles.textField}
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          error={!!errors.password}
          helperText={errors.password}
          FormHelperTextProps={{
            sx: styles.helperText,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button 
          fullWidth 
          variant="contained" 
          color="primary" 
          sx={styles.button}
          onClick={handleLogin}
        >
          Entrar
        </Button>
      </div>
    </motion.div>
  )
}

export default Login
