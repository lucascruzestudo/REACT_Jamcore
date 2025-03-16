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
import ProfilePage from './pages/profile.tsx'
import { useEffect } from 'react'
import TrackPage from './pages/trackpage.tsx'
import CreateTrackPage from './pages/createtrack.tsx'

export const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation()

  return (
    <>
      {location.pathname !== '/login' && (
        <>
          <Navbar />
          <div style={{ paddingTop: '20px' }}></div>
        </>
      )}

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/track/:trackid" element={<TrackPage />} />
            <Route path="/track/create" element={<CreateTrackPage />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Route>
        </Routes>
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
          <Router>
            <AppContent />
            <ToastContainer />
          </Router>
        </TrackProvider>
      </UserProvider>

    </QueryClientProvider>
  )
}
