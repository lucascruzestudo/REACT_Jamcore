import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Login from './pages/login.tsx'
import PrivateRoute from './routes/private-route'
import Feed from './pages/feed.tsx'
import { TrackProvider } from './contexts/trackcontext.tsx'
import Navbar from './components/navbar.tsx'
import Footer from './components/footer.tsx'
import { UserProvider } from './contexts/usercontext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react'
import TrackPage from './pages/trackpage.tsx'
import CreateTrackPage from './pages/createtrack.tsx'
import UserProfilePage from './pages/user.tsx'
import Register from './pages/register.tsx'
import ConfirmAccount from './pages/confirmaccount.tsx'
import UpdateTrackPage from './pages/updatetrack.tsx'
import { TrackInteractionProvider } from './contexts/trackinteractioncontext.tsx'
import { CommentProvider } from './contexts/commentcontext.tsx'
import { useTrack } from './contexts/trackcontext.tsx'
import { Box } from '@mui/material'

export const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation()
  const { currentTrack } = useTrack()
  const showNav = location.pathname !== '/login' && location.pathname !== '/register' && !location.pathname.startsWith('/confirmaccount/')

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
            <Route path="/track/:trackid" element={<TrackPage />} />
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/track/create" element={<CreateTrackPage />} />
            <Route path="/track/:trackid/edit" element={<UpdateTrackPage />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Route>
        </Routes>
      </Box>

      <Footer />
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
