import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function PrivateRoute() {
  const token = useAuthStore((state) => state.token)
  
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
