import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { Home, Map, QrCode, CreditCard, MessageSquare, Route, Clock, User, Settings, Bell } from "lucide-react"

const sidebarItems = [
  {
    title: "Home",
    href: "/commuter",
    icon: Home,
  },
  {
    title: "Track Matatu",
    href: "/commuter/track",
    icon: Map,
  },
  {
    title: "QR Pass",
    href: "/commuter/pass",
    icon: QrCode,
  },
  {
    title: "Book Matatu",
    href: "/commuter/book",
    icon: CreditCard,
  },
  {
    title: "Feedback",
    href: "/commuter/feedback",
    icon: MessageSquare,
  },
  {
    title: "Routes",
    href: "/commuter/routes",
    icon: Route,
  },
  {
    title: "Schedules",
    href: "/commuter/schedules",
    icon: Clock,
  },
  {
    title: "Notifications",
    href: "/commuter/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    href: "/commuter/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/commuter/settings",
    icon: Settings,
  },
]

export default function CommuterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
        <Sidebar items={sidebarItems} className="z-60" />
        <TopNav userType="commuter" userName="John Doe" userInitials="JD" />
      </header>
      <main className="flex-1 md:ml-60">
        <div className="container py-6 md:py-12">{children}</div>
      </main>
    </div>
  )
}

