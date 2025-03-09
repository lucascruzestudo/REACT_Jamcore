import Track from '../components/track'
import { useAuthStore } from '../store/auth'
import { Button, Container, Typography } from '@mui/material'

export default function Feed() {
  const logout = useAuthStore((state) => state.logout)

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Dashboard!
      </Typography>
      <Button variant="contained" color="secondary" onClick={logout}>
        Sair
      </Button>

      <Track
        imageUrl="https://bgceohesbgirgijwxbhn.supabase.co/storage/v1/object/public/jamcore-tracks//track_233cb71c-78f0-491f-a2ce-188f1b233322_image.jpg"
        title="DO A CRIME"
        audioFileUrl="https://bgceohesbgirgijwxbhn.supabase.co/storage/v1/object/public/jamcore-tracks//track_233cb71c-78f0-491f-a2ce-188f1b233322_audio.mp3"
        playCount={10000}
        username="SYCHO"
        tags={['trap', 'rap', 'hip-hop']}
        likeCount={1000}
        createdAt="2025-01-01"
      />

      <Track
        imageUrl="https://bgceohesbgirgijwxbhn.supabase.co/storage/v1/object/public/jamcore-tracks/track_68a8de33-4025-4e4a-8c77-bbb9531e5a16_image.jpg"
        title="SOUDIERE - CANT UNDERSTAND"
        audioFileUrl="https://bgceohesbgirgijwxbhn.supabase.co/storage/v1/object/public/jamcore-tracks/track_68a8de33-4025-4e4a-8c77-bbb9531e5a16_audio.mp3"
        playCount={200}
        username="SYCHO"
        tags={['trap', 'rap', 'hip-hop']}
        likeCount={15}
        createdAt="2025-03-09"
      />
    </Container>
  )
}
