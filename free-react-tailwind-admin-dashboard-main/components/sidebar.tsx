"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bus, Menu, MapPin, RouteIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string
    title: string
    icon: React.ElementType
  }[]
}

export function Sidebar({ className, items, ...props }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // Filter out duplicate navigation items that are already in the top navbar
  const filteredItems = items.filter((item) => !["Notifications", "Profile", "Settings"].includes(item.title))

  const commuterLinks = [
    ...filteredItems,
    {
      title: "Find Routes",
      href: "/commuter/find-routes",
      icon: RouteIcon
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden hover:bg-zurura-50 hover:text-zurura-500 absolute right-4 top-1/2 -translate-y-1/2 z-50"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 sm:max-w-xs bg-white border-r border-zurura-100">
          <div className="flex items-center justify-center gap-2 pb-4">
            <Bus className="h-6 w-6 text-zurura-500" />
            <span className="text-lg font-bold gradient-text">Zurura</span>
          </div>
          <nav className="grid gap-2 text-sm">
            {commuterLinks.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-zurura-50 text-zurura-700 font-medium"
                      : "text-muted-foreground hover:bg-zurura-50/50 hover:text-zurura-600",
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-zurura-500" : "text-muted-foreground")} />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div
        className={cn(
          "hidden border-r border-zurura-100 bg-white h-screen md:flex md:w-60 md:flex-col md:fixed md:inset-y-0",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center gap-2 px-4">
            <Bus className="h-6 w-6 text-zurura-500" />
            <span className="text-lg font-bold gradient-text">Zurura</span>
          </div>
          <nav className="grid gap-1 px-2">
            {commuterLinks.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-zurura-50 text-zurura-700 font-medium"
                      : "text-muted-foreground hover:bg-zurura-50/50 hover:text-zurura-600",
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-zurura-500" : "text-muted-foreground")} />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

