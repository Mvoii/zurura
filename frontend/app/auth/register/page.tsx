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

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("commuter")
  const { register, registerOperator, isRegistering, isRegisteringOperator } = useAuth()
  const [passwordError, setPasswordError] = useState('')

  const handleCommuterRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    register({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      school_name: formData.get('school_name') as string || 'None'
    })
  }
  
  const handleOperatorRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    registerOperator({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      company: formData.get('company') as string
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
          <CardDescription>Create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="commuter" onValueChange={setUserType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="commuter">Commuter</TabsTrigger>
              <TabsTrigger value="operator">Operator</TabsTrigger>
            </TabsList>
            <TabsContent value="commuter">
              <form onSubmit={handleCommuterRegister} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commuter-first-name">First Name</Label>
                    <Input id="commuter-first-name" name="first_name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commuter-last-name">Last Name</Label>
                    <Input id="commuter-last-name" name="last_name" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commuter-email">Email</Label>
                  <Input id="commuter-email" name="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commuter-school">School Name</Label>
                  <Input id="commuter-school" name="school_name" placeholder="University of Nairobi" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commuter-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="commuter-password"
                      name="password"
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
                <div className="space-y-2">
                  <Label htmlFor="commuter-confirm-password">Confirm Password</Label>
                  <Input
                    id="commuter-confirm-password"
                    name="confirm_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                <Button type="submit" className="w-full bg-zurura-500 hover:bg-zurura-600" disabled={isRegistering}>
                  {isRegistering ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="operator">
              <form onSubmit={handleOperatorRegister} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operator-first-name">First Name</Label>
                    <Input id="operator-first-name" name="first_name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operator-last-name">Last Name</Label>
                    <Input id="operator-last-name" name="last_name" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-company-name">Company Name</Label>
                  <Input id="operator-company-name" name="company" placeholder="Acme Matatu Services" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-email">Email</Label>
                  <Input id="operator-email" name="email" type="email" placeholder="info@acmematatu.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="operator-password"
                      name="password"
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
                <div className="space-y-2">
                  <Label htmlFor="operator-confirm-password">Confirm Password</Label>
                  <Input
                    id="operator-confirm-password"
                    name="confirm_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                <Button type="submit" className="w-full bg-zurura-500 hover:bg-zurura-600" disabled={isRegisteringOperator}>
                  {isRegisteringOperator ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center">
          <div className="text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-zurura-500 hover:text-zurura-700 underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

