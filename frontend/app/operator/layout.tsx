import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { BarChart, Bus, FileText, Home, Route, Ticket, Users } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/operator",
    icon: Home,
  },
  {
    title: "Analytics",
    href: "/operator/analytics",
    icon: BarChart,
  },
  {
    title: "Matatus",
    href: "/operator/matatus",
    icon: Bus,
  },
  {
    title: "Drivers",
    href: "/operator/drivers",
    icon: Users,
  },
  {
    title: "Routes",
    href: "/operator/routes",
    icon: Route,
  },
  {
    title: "Passes",
    href: "/operator/passes",
    icon: Ticket,
  },
  {
    title: "Reports",
    href: "/operator/reports",
    icon: FileText,
  },
  // Removed duplicate items that are already in the top navbar
  // {
  //   title: "Notifications",
  //   href: "/operator/notifications",
  //   icon: Bell,
  // },
  // {
  //   title: "Profile",
  //   href: "/operator/profile",
  //   icon: User,
  // },
  // {
  //   title: "Settings",
  //   href: "/operator/settings",
  //   icon: Settings,
  // },
]

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
        <Sidebar items={sidebarItems} className="z-60" />
        <TopNav userType="operator" userName="Operator Account" userInitials="OP" />
      </header>
      <main className="flex-1 md:ml-60">
        <div className="container py-6 md:py-12">{children}</div>
      </main>
    </div>
  )
}

