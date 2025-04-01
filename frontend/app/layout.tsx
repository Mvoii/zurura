import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { AppHeader } from "@/components/AppHeader"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Zurura - Revolutionizing Urban Transport",
  description: "Connect with matatus in real-time, book seats, and travel with ease.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex flex-col min-h-screen">
              <AppHeader />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

