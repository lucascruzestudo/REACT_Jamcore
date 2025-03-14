import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { getUserProfile, updateUserProfile } from '../services/profileservice';

interface UserProfile {
  userId: string;
  displayName: string;
  bio: string;
  location: string;
  profilePictureUrl: string;
  updatedAt: string;
}

interface UserContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (formData: FormData) => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, token, login, logout } = useAuthStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }

    const fetchUserProfile = async () => {
      if (user) {
        const profile = await getUserProfile();
        if (profile) {
          const updatedProfile = { 
            ...profile, 
            updatedAt: new Date().toISOString()
          };
          setUserProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }
      }
    };
    

    if (user) {
      fetchUserProfile();
    }
  }, [user]);
  

  const updateProfile = async (formData: FormData) => {
    try {
      await updateUserProfile(formData);
      const profile = await getUserProfile();
      if (profile) {
        const updatedProfile = { 
          ...profile, 
          updatedAt: new Date().toISOString()
        };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, token, login, logoutUser: logout, userProfile, setUserProfile, updateUserProfile: updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
