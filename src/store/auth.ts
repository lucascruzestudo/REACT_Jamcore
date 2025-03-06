import { create } from 'zustand'
import Cookies from 'js-cookie'
import api from '../services/api'

interface AuthState {
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    token: Cookies.get('token') || null,
  
    login: async (login, password) => {
      try {
        const response = await api.post('Authentication/Login', { login, password })
        const token = response.data
  
        Cookies.set('token', token, { expires: 7 })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  
        set({ token })
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },
  
    logout: () => {
      Cookies.remove('token')
      delete api.defaults.headers.common['Authorization']
      set({ token: null })
    }
  }))
  