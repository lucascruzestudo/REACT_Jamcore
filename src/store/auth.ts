import { create } from 'zustand'
import Cookies from 'js-cookie'
import api from '../services/api'
import { queryClient } from '../App'
import { useUser } from '../contexts/usercontext'

interface User {
  id: string
  username: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Token is stored only in cookie (secure + sameSite in production)
  const token = Cookies.get('token') || null;
  const user = token ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  return {
    token,
    user,

    login: async (email, password) => {
      try {
        const response = await api.post('Authentication/Login', { login: email, password });
        const token = response.data.data.token;
        const user = response.data.data;

        Cookies.set('token', token, {
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: 'strict',
        });
        localStorage.setItem('user', JSON.stringify(user));

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Limpa qualquer cache de query anterior para garantir dados frescos do novo usuário
        queryClient.clear();

        set({ token, user });
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },

    logout: () => {
      Cookies.remove('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      queryClient.clear();
      queryClient.invalidateQueries();
      set({ token: null, user: null });
      const { logoutUser } = useUser();
      logoutUser();
    }
  };
});
