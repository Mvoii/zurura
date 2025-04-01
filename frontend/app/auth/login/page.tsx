"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bus, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/lib/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("commuter")
  const [formValues, setFormValues] = useState({ email: '', password: '' })
  const { login, isLoggingIn } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    console.log('Form values before submit:', { email, password })
    
    login({
      email,
      password
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zurura-50 to-ocean-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Bus className="h-12 w-12 text-zurura-500" />
          </div>
          <CardTitle className="text-2xl gradient-text">Zurura</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="commuter" onValueChange={setUserType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="commuter">Commuter</TabsTrigger>
              <TabsTrigger value="operator">Operator</TabsTrigger>
            </TabsList>
            <TabsContent value="commuter">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="commuter-email">Email</Label>
                  <Input 
                    id="commuter-email" 
                    name="email" 
                    value={formValues.email}
                    onChange={handleInputChange}
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commuter-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="commuter-password"
                      name="password"
                      value={formValues.password}
                      onChange={handleInputChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                </div>
                <Button type="submit" className="w-full bg-zurura-500 hover:bg-zurura-600" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Logging in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="operator">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="operator-email">Email</Label>
                  <Input 
                    id="operator-email" 
                    name="email" 
                    value={formValues.email}
                    onChange={handleInputChange}
                    type="email" 
                    placeholder="operator@example.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="operator-password"
                      name="password"
                      value={formValues.password}
                      onChange={handleInputChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                </div>
                <Button type="submit" className="w-full bg-zurura-500 hover:bg-zurura-600" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Logging in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <Link href="#" className="text-zurura-500 hover:text-zurura-700 underline underline-offset-4">
              Forgot your password?
            </Link>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-zurura-500 hover:text-zurura-700 underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
