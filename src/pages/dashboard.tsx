import { useAuthStore } from '../store/auth'
import { Button, Container, Typography } from '@mui/material'

export default function Dashboard() {
  const logout = useAuthStore((state) => state.logout)

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Dashboard!
      </Typography>
      <Button variant="contained" color="secondary" onClick={logout}>
        Sair
      </Button>
    </Container>
  )
}
