"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useMemo } from "react"

// Types
export type User = {
  username: string
  role: string
  token: string
}

type AppContextType = {
  user: User | null
  setUser: (user: User | null) => void
  isOpen: boolean
  toggleSidebar: () => void
  logout: () => void
  isAuthenticated: boolean
}

// Create context
const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  isOpen: true,
  toggleSidebar: () => {},
  logout: () => {},
  isAuthenticated: false,
})

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize user from localStorage - only run once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error)
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  // Update authentication state when user changes
  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = "/login"
  }

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      setUser: (newUser: User | null) => {
        setUser(newUser)
        if (newUser) {
          localStorage.setItem("user", JSON.stringify(newUser))
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem("user")
          setIsAuthenticated(false)
        }
      },
      isOpen,
      toggleSidebar,
      logout,
      isAuthenticated,
    }),
    [user, isOpen, isAuthenticated],
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

// Hook for using the context
export const useAppContext = () => useContext(AppContext)

