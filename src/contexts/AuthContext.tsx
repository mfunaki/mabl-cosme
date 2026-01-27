import React, { createContext, useContext, useState, useCallback } from 'react'
import { API_SERVERS, type ApiServerId } from '../constants/config'

interface AuthContextType {
  isLoggedIn: boolean
  token: string | null
  username: string | null
  login: (username: string, password: string, apiServerId: ApiServerId) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const login = useCallback(async (
    inputUsername: string,
    inputPassword: string,
    apiServerId: ApiServerId
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const apiServer = API_SERVERS.find((s) => s.id === apiServerId)
      const baseUrl = apiServer?.url || ''

      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: inputUsername,
          password: inputPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        setToken(data.token)
        setUsername(inputUsername)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Failed to connect to server' }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUsername(null)
  }, [])

  const value: AuthContextType = {
    isLoggedIn: !!token,
    token,
    username,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
