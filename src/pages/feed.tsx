import { useEffect, useState } from 'react'
import { Container, Divider, Typography } from '@mui/material'
import Track from '../components/track'
import api from '../services/api'
import Loader from '../components/loader'

export default function Feed() {

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
    <Container>
      <Divider sx={{ marginTop: 1, borderColor: 'transparent' }}/>

      <Typography variant="h5" sx={{ color: '#666'}}>
        escute as jams mais recentes:
      </Typography>

      <Divider sx={{ marginTop: 3, borderColor: 'transparent' }}/>

      <Container sx={{ display: 'flex', flexDirection: 'column', gap: 4}}>
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
      </Container>

      {isLoading && <Loader />}

    </Container>
  )
}
