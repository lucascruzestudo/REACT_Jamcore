import React, { createContext, useContext, ReactNode } from 'react'
import { useAuthStore } from '../store/auth'

interface UserProviderProps {
  children: ReactNode
}

const UserContext = createContext<any>(null)

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, token, login, logout } = useAuthStore()

  return (
    <UserContext.Provider value={{ user, token, login, logoutUser: logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
