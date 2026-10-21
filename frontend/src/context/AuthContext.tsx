import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { User } from '../types'
import i18n from '../i18n/i18n'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lingrove_token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('lingrove_token')
    if (!currentToken) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
      if (res.data.preferred_language) {
        i18n.changeLanguage(res.data.preferred_language)
      }
    } catch {
      localStorage.removeItem('lingrove_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('lingrove_token', newToken)
    setToken(newToken)
    setUser(userData)
    if (userData.preferred_language) {
      i18n.changeLanguage(userData.preferred_language)
    }
  }

  const logout = () => {
    localStorage.removeItem('lingrove_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
