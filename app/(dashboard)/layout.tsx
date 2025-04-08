"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/lib/app-context"
import { AppShell } from "@/components/layout/app-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAppContext()
  const router = useRouter()

  // Protect routes - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  return <AppShell>{children}</AppShell>
}

