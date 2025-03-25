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

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("commuter")

  const handleRegister = (e) => {
    e.preventDefault()
    if (userType === "commuter") {
      router.push("/commuter")
    } else {
      router.push("/operator")
    }
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
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commuter-first-name">First Name</Label>
                    <Input id="commuter-first-name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commuter-last-name">Last Name</Label>
                    <Input id="commuter-last-name" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commuter-email">Email</Label>
                  <Input id="commuter-email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commuter-phone">Phone Number</Label>
                  <Input id="commuter-phone" type="tel" placeholder="07XX XXX XXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commuter-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="commuter-password"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-zurura-500 hover:bg-zurura-600">
                  Create Account
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="operator">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="operator-company-name">Company Name</Label>
                  <Input id="operator-company-name" placeholder="Acme Matatu Services" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-email">Email</Label>
                  <Input id="operator-email" type="email" placeholder="info@acmematatu.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-phone">Phone Number</Label>
                  <Input id="operator-phone" type="tel" placeholder="07XX XXX XXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-license">Business License Number</Label>
                  <Input id="operator-license" placeholder="BL-12345-2025" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="operator-password"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-zurura-500 hover:bg-zurura-600">
                  Create Account
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

