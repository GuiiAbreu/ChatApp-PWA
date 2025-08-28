"use client"

import { useState } from "react"
import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { cn } from "@/lib/utils"

interface NotificationSettingsProps {
  className?: string
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  } = usePushNotifications()

  if (!isSupported) {
    return null
  }

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      if (permission !== "granted") {
        const granted = await requestPermission()
        if (!granted) return
      }
      await subscribe()
    }
  }

  const handleTestNotification = async () => {
    await showNotification("Test Notification", "This is a test notification from ChatApp!")
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="text-sidebar-foreground hover:bg-sidebar-accent/10"
      >
        {isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      </Button>

      {showSettings && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-popover border border-border rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Push Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                ×
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Notifications</p>
                  <p className="text-xs text-muted-foreground">Get notified of new messages</p>
                </div>
                <Button
                  size="sm"
                  variant={isSubscribed ? "destructive" : "default"}
                  onClick={handleToggleNotifications}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : isSubscribed ? "Disable" : "Enable"}
                </Button>
              </div>

              {permission === "denied" && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-xs text-destructive">
                    Notifications are blocked. Please enable them in your browser settings.
                  </p>
                </div>
              )}

              {isSubscribed && (
                <div className="pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestNotification}
                    className="w-full bg-transparent"
                  >
                    Test Notification
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
