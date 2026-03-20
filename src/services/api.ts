import axios from 'axios'
import Cookies from 'js-cookie'
import { useAuthStore } from '../store/auth'

// VITE_API_BASE_URL must be set in .env for production
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : '')) as string;

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not defined. Set it in your .env.production file.');
}

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
