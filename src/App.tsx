import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify' // Import ToastContainer
import Login from './pages/login.tsx'
import Dashboard from './pages/dashboard'
import PrivateRoute from './routes/private-route'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  )
}
