"use client"

import { useState } from "react"
import { Bell, Check, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  category: "system" | "driver" | "matatu" | "revenue" | "alert"
}

export default function OperatorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New driver application",
      description: "James Mwangi has applied",
      time: "Just now",
      read: false,
      category: "driver",
    },
    {
      id: "2",
      title: "Maintenance alert",
      description: "KBZ 123X is due for service",
      time: "3 hours ago",
      read: false,
      category: "matatu",
    },
    {
      id: "3",
      title: "Revenue milestone reached",
      description: "You've reached KES 1M this month",
      time: "Yesterday",
      read: false,
      category: "revenue",
    },
    {
      id: "4",
      title: "Driver performance report",
      description: "Monthly performance reports are ready",
      time: "2 days ago",
      read: true,
      category: "driver",
    },
    {
      id: "5",
      title: "Route congestion alert",
      description: "Heavy traffic reported on CBD to Westlands route",
      time: "3 days ago",
      read: true,
      category: "alert",
    },
    {
      id: "6",
      title: "Welcome to Zurura Operator",
      description: "Thank you for joining our platform",
      time: "1 week ago",
      read: true,
      category: "system",
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts and information</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="driver">Driver</TabsTrigger>
          <TabsTrigger value="matatu">Matatu</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View all your notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start justify-between p-4 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            notification.category === "system"
                              ? "bg-blue-100 text-blue-600"
                              : notification.category === "driver"
                                ? "bg-green-100 text-green-600"
                                : notification.category === "matatu"
                                  ? "bg-purple-100 text-purple-600"
                                  : notification.category === "revenue"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>View your unread notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter((n) => !n.read).length > 0 ? (
                  notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${
                              notification.category === "system"
                                ? "bg-blue-100 text-blue-600"
                                : notification.category === "driver"
                                  ? "bg-green-100 text-green-600"
                                  : notification.category === "matatu"
                                    ? "bg-purple-100 text-purple-600"
                                    : notification.category === "revenue"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No unread notifications</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="driver">
          <Card>
            <CardHeader>
              <CardTitle>Driver Notifications</CardTitle>
              <CardDescription>View notifications related to your drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter((n) => n.category === "driver").length > 0 ? (
                  notifications
                    .filter((n) => n.category === "driver")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start justify-between p-4 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No driver notifications</h3>
                    <p className="text-muted-foreground">You have no driver notifications at the moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matatu">
          <Card>
            <CardHeader>
              <CardTitle>Matatu Notifications</CardTitle>
              <CardDescription>View notifications related to your matatus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter((n) => n.category === "matatu").length > 0 ? (
                  notifications
                    .filter((n) => n.category === "matatu")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start justify-between p-4 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No matatu notifications</h3>
                    <p className="text-muted-foreground">You have no matatu notifications at the moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Notifications</CardTitle>
              <CardDescription>View notifications related to your revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter((n) => n.category === "revenue").length > 0 ? (
                  notifications
                    .filter((n) => n.category === "revenue")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start justify-between p-4 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No revenue notifications</h3>
                    <p className="text-muted-foreground">You have no revenue notifications at the moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alert">
          <Card>
            <CardHeader>
              <CardTitle>Alert Notifications</CardTitle>
              <CardDescription>View important alerts and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter((n) => n.category === "alert").length > 0 ? (
                  notifications
                    .filter((n) => n.category === "alert")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start justify-between p-4 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No alert notifications</h3>
                    <p className="text-muted-foreground">You have no alert notifications at the moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

