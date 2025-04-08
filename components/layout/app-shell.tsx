"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAppContext } from "@/lib/app-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Don't render layout if not authenticated
  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4">{children}</main>
      </div>
    </div>
  )
}

