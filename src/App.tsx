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
        </Route>
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
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
