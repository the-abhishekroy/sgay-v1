"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAppContext } from "@/lib/app-context"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const router = useRouter()
  const { toast } = useToast()
  const { setUser, isAuthenticated } = useAppContext()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simple validation
    if (!formData.username || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both username and password",
      })
      setIsLoading(false)
      return
    }

    // Dummy authentication logic
    let role = ""
    if (formData.username.toLowerCase() === "admin" && formData.password === "admin123") {
      role = "admin"
    } else if (formData.username.toLowerCase() === "officer" && formData.password === "officer123") {
      role = "officer"
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid username or password",
      })
      setIsLoading(false)
      return
    }

    // Create user object
    const userData = {
      username: formData.username,
      role: role,
      token: "dummy-jwt-token-" + role + "-" + Date.now(),
    }

    // Store user info in context (which will save to localStorage)
    setUser(userData)

    toast({
      title: "Login Successful",
      description: `Welcome, ${formData.username}!`,
    })

    // Small delay to ensure state is updated
    setTimeout(() => {
      router.push("/dashboard")
      setIsLoading(false)
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">SGAY GIS-MIS</CardTitle>
          <CardDescription>Government Scheme Monitoring System</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  className="pl-9"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="text-xs text-muted-foreground">Try: &quot;admin&quot; or &quot;officer&quot;</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-9"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Password: &quot;admin123&quot; or &quot;officer123&quot;
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

