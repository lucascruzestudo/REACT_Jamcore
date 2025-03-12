import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify' // Import ToastContainer
import Login from './pages/login.tsx'
import PrivateRoute from './routes/private-route'
import Feed from './pages/feed.tsx'
import { TrackProvider } from './contexts/trackcontext.tsx'

export default function App() {
  return (
    <TrackProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/feed" element={<Feed />} />
          </Route>
        </Routes>
        <ToastContainer />
      </Router>
    </TrackProvider>
  )
}
