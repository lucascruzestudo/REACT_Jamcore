import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ScrollToTop from './components/scrolltotop'
import { ToastContainer } from 'react-toastify'
import Login from './pages/login.tsx'
import PrivateRoute from './routes/private-route'
import Feed from './pages/feed.tsx'
import { TrackProvider } from './contexts/trackcontext.tsx'
import Navbar from './components/navbar.tsx'
import Footer from './components/footer.tsx'
import { UserProvider } from './contexts/usercontext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react'
import TrackPage from './pages/trackpage.tsx'
import CreateTrackPage from './pages/createtrack.tsx'
import UserProfilePage from './pages/user.tsx'
import Register from './pages/register.tsx'
import ConfirmAccount from './pages/confirmaccount.tsx'
import UpdateTrackPage from './pages/updatetrack.tsx'
import SearchResults from './pages/searchresults.tsx'
import { TrackInteractionProvider } from './contexts/trackinteractioncontext.tsx'
import { CommentProvider } from './contexts/commentcontext.tsx'
import { useTrack } from './contexts/trackcontext.tsx'
import { useUser } from './contexts/usercontext.tsx'
import { Box } from '@mui/material'
import api from './services/api.ts'

export const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation()
  const { currentTrack, volume, setVolume } = useTrack()
  const { userProfile } = useUser()
  const showNav = location.pathname !== '/login' && location.pathname !== '/register' && !location.pathname.startsWith('/confirmaccount/')

  // ── Sync volume: apply on every profile update (localStorage + API) ───────
  // lastLoadedVolume tracks the most recent volume received from the server so
  // the save effect can distinguish "just applied from server" from "user changed".
  const lastLoadedVolume = useRef<number | null>(null)
  useEffect(() => {
    if (userProfile) {
      const vol = userProfile.volume ?? 1
      lastLoadedVolume.current = vol
      setVolume(vol)
    }
  }, [userProfile])

  // ── Debounce-save only user-initiated changes ─────────────────────────────
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (lastLoadedVolume.current === null) return         // profile not loaded yet
    if (volume === lastLoadedVolume.current) return        // just applied from server, skip
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      lastLoadedVolume.current = volume
      api.patch('Profile/volume', volume).catch(() => {})
    }, 800)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [volume])

  return (
    <>
      {showNav && (
        <>
          <Navbar />
          <div style={{ paddingTop: '20px' }}></div>
        </>
      )}

      <Box sx={{ pb: currentTrack ? { xs: '108px', sm: '80px' } : 0 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/confirmaccount/:token' element={<ConfirmAccount />} />
          <Route element={<PrivateRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/track/:trackid" element={<TrackPage />} />
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/track/create" element={<CreateTrackPage />} />
            <Route path="/track/:trackid/edit" element={<UpdateTrackPage />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Route>
        </Routes>
      </Box>

      {showNav && <Footer />}
    </>
  )
}

export default function App() {

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === " " && event.target === document.body) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TrackProvider>
          <TrackInteractionProvider>
            <CommentProvider>
              <Router>
                <ScrollToTop />
                <AppContent />
                <ToastContainer />
              </Router>
            </CommentProvider>
          </TrackInteractionProvider>
        </TrackProvider>
      </UserProvider>

    </QueryClientProvider>
  )
}
