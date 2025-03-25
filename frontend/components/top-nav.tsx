"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Bus, LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TopNavProps {
  userType: "commuter" | "operator"
  userName: string
  userInitials: string
  userAvatar?: string
}

export function TopNav({ userType, userName, userInitials, userAvatar }: TopNavProps) {
  const router = useRouter()
  const [unreadNotifications, setUnreadNotifications] = useState(3)

  const handleSignOut = () => {
    // Sign out logic would go here
    router.push("/auth/login")
  }

  const markAllAsRead = () => {
    setUnreadNotifications(0)
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="md:hidden flex items-center gap-2 ml-12">
        <Bus className="h-6 w-6 text-zurura-500" />
        <span className="text-lg font-bold gradient-text">Zurura</span>
      </div>

      <div className="flex-1 md:flex-none"></div>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative hover:bg-zurura-50 hover:text-zurura-500 focus:ring-zurura-500"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="flex items-center justify-between pb-2 border-b">
              <h4 className="font-medium">Notifications</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-zurura-600 hover:text-zurura-700 hover:bg-zurura-50"
              >
                Mark all as read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {userType === "commuter" ? (
                <>
                  <div className="py-2 px-1 border-b hover:bg-zurura-50/50 transition-colors">
                    <p className="text-sm font-medium">Your matatu is arriving in 5 minutes</p>
                    <p className="text-xs text-muted-foreground">Route: CBD to Westlands</p>
                    <p className="text-xs text-zurura-500">Just now</p>
                  </div>
                  <div className="py-2 px-1 border-b hover:bg-zurura-50/50 transition-colors">
                    <p className="text-sm font-medium">Your monthly pass expires tomorrow</p>
                    <p className="text-xs text-muted-foreground">Renew now to avoid interruption</p>
                    <p className="text-xs text-zurura-500">2 hours ago</p>
                  </div>
                  <div className="py-2 px-1 hover:bg-zurura-50/50 transition-colors">
                    <p className="text-sm font-medium">Booking confirmed</p>
                    <p className="text-xs text-muted-foreground">Your seat has been reserved</p>
                    <p className="text-xs text-zurura-500">Yesterday</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="py-2 px-1 border-b hover:bg-zurura-50/50 transition-colors">
                    <p className="text-sm font-medium">New driver application</p>
                    <p className="text-xs text-muted-foreground">James Mwangi has applied</p>
                    <p className="text-xs text-zurura-500">Just now</p>
                  </div>
                  <div className="py-2 px-1 border-b hover:bg-zurura-50/50 transition-colors">
                    <p className="text-sm font-medium">Maintenance alert</p>
                    <p className="text-xs text-muted-foreground">KBZ 123X is due for service</p>
                    <p className="text-xs text-zurura-500">3 hours ago</p>
                  </div>
                  <div className="py-2 px-1 hover:bg-zurura-50/50 transition-colors">
                    <p className="text-sm font-medium">Revenue milestone reached</p>
                    <p className="text-xs text-muted-foreground">You've reached KES 1M this month</p>
                    <p className="text-xs text-zurura-500">Yesterday</p>
                  </div>
                </>
              )}
            </div>
            <div className="pt-2 border-t mt-2 text-center">
              <Link
                href={`/${userType}/notifications`}
                className="text-sm text-zurura-500 hover:text-zurura-700 hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-zurura-50 focus:ring-zurura-500 transition-colors"
            >
              <Avatar className="h-8 w-8 border-2 border-zurura-500/20 hover:border-zurura-500/50 transition-colors">
                {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                <AvatarFallback className="bg-gradient-to-br from-zurura-500 to-ocean-500 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userType === "commuter" ? "Commuter" : "Operator"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(`/${userType}/profile`)}
                className="hover:bg-zurura-50 hover:text-zurura-700 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4 text-zurura-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/${userType}/settings`)}
                className="hover:bg-zurura-50 hover:text-zurura-700 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4 text-zurura-500" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-700 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

