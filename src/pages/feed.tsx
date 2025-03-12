import { useEffect, useState } from 'react'
import { Button, Container, Typography } from '@mui/material'
import Track from '../components/track'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

export default function Feed() {
  const logout = useAuthStore((state) => state.logout)

  const [tracks, setTracks] = useState<any[]>([])
  const [pageNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)

  const fetchTracks = async (pageNumber: number) => {
    if (isLoading || !hasNextPage) return
    setIsLoading(true)

    try {
      const response = await api.get('Track', {
        params: {
          pageNumber,
          pageSize: 10,
        },
      })

      if (pageNumber === 1) {
        setTracks(response.data.data.tracks.items)
      } else {
        setTracks((prevTracks) => [...prevTracks, ...response.data.data.tracks.items])
      }

      setHasNextPage(response.data.data.tracks.hasNextPage)
    } catch (error) {
      console.error('Error fetching tracks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTracks(pageNumber)
  }, [pageNumber])

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        escute as jams mais recentes
      </Typography>
      <Button variant="contained" color="secondary" onClick={logout}>
        sair
      </Button>

      {tracks.map((track) => (
        <Track
          key={track.id}
          id={track.id}
          imageUrl={track.imageUrl}
          title={track.title}
          audioFileUrl={track.audioFileUrl}
          playCount={track.playCount}
          username={track.username}
          tags={track.tags}
          likeCount={track.likeCount}
          createdAt={track.createdAt}
          userLikedTrack={track.userLikedTrack}
          originalDuration={track.duration}
        />
      ))}

      {isLoading && <Typography>Carregando...</Typography>}
    </Container>
  )
}
