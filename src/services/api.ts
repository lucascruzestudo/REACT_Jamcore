import axios from 'axios'
import Cookies from 'js-cookie'
import { useAuthStore } from '../store/auth'

// Use Vite env var; default to localhost in development, production API in production
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : 'https://dotnet-jamcoreapi.onrender.com')) as string;
const baseURL = API_BASE.replace(/\/$/, '') + '/api/v1/'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
