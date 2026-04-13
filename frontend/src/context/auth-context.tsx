"use client"

import { createContext, useEffect, useState } from "react"
import { authService } from "@/services/auth"

export interface User {
  id: string
  email: string
  name: string
  bio?: string
  avatar_url?: string
  role: "admin" | "user"
  skill_count?: number
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        setToken(storedToken)
        try {
          const userData = await authService.getMe()
          setUser(userData)
        } catch (error) {
          console.error("Failed to fetch user", error)
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await authService.login(email, password)
      const { access_token } = data
      localStorage.setItem("token", access_token)
      setToken(access_token)
      
      const userData = await authService.getMe()
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await authService.register(name, email, password)
      const { access_token } = data
      localStorage.setItem("token", access_token)
      setToken(access_token)
      
      const userData = await authService.getMe()
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
