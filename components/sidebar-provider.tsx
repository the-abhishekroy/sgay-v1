"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
  user: User | null
  logout: () => void
}

type User = {
  username: string
  role: string
  token: string
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  user: null,
  logout: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Get user from localStorage
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error("Failed to parse user from localStorage", error)
          localStorage.removeItem("user")
        }
      }
    }
  }, [])

  const toggle = () => {
    setIsOpen(!isOpen)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    // Redirect to login page
    window.location.href = "/login"
  }

  return <SidebarContext.Provider value={{ isOpen, toggle, user, logout }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)

