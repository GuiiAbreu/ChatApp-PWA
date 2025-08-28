"use client"

import { useState } from "react"
import { Download, Share, Maximize, Settings, Trash2, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePWA } from "@/hooks/use-pwa"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useCacheManager } from "@/hooks/use-cache-manager"
import { cn } from "@/lib/utils"

interface PWASettingsProps {
  className?: string
}

export function PWASettings({ className }: PWASettingsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const { isInstalled, isStandalone, canInstall, isInstalling, installApp, shareApp, toggleFullscreen } = usePWA()
  const { isSubscribed, permission } = usePushNotifications()
  const { cacheSize, clearCaches, requestPersistentStorage, isLoading } = useCacheManager()

  const handleShare = async () => {
    const success = await shareApp()
    if (!success) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin)
        // You could show a toast here
      } catch (error) {
        console.error("Failed to copy to clipboard:", error)
      }
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="text-sidebar-foreground hover:bg-sidebar-accent/10"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {showSettings && (
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-popover border border-border rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">PWA Settings</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                ×
              </Button>
            </div>

            {/* Installation Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">App Status</p>
                  <p className="text-xs text-muted-foreground">
                    {isInstalled ? "Installed as PWA" : isStandalone ? "Running standalone" : "Running in browser"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {canInstall && (
                    <Button size="sm" onClick={installApp} disabled={isInstalling}>
                      <Download className="w-3 h-3 mr-1" />
                      {isInstalling ? "..." : "Install"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    <Share className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Fullscreen Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Fullscreen Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle fullscreen display</p>
                </div>
                <Button size="sm" variant="outline" onClick={toggleFullscreen}>
                  <Maximize className="w-3 h-3 mr-1" />
                  Toggle
                </Button>
              </div>

              {/* Notifications Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {permission === "granted" && isSubscribed
                      ? "Enabled"
                      : permission === "denied"
                        ? "Blocked"
                        : "Not enabled"}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    permission === "granted" && isSubscribed
                      ? "bg-green-500"
                      : permission === "denied"
                        ? "bg-red-500"
                        : "bg-yellow-500",
                  )}
                />
              </div>

              {/* Storage Management */}
              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Storage Usage</p>
                    <p className="text-xs text-muted-foreground">Cache size: {cacheSize}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={requestPersistentStorage} disabled={isLoading}>
                    <HardDrive className="w-3 h-3 mr-1" />
                    {isLoading ? "..." : "Persist"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Clear Cache</p>
                    <p className="text-xs text-muted-foreground">Free up storage space</p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={clearCaches} disabled={isLoading}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    {isLoading ? "..." : "Clear"}
                  </Button>
                </div>
              </div>

              {/* App Info */}
              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Version: 1.0.0</p>
                  <p>Build: {process.env.NODE_ENV}</p>
                  <p>Features: WebSocket, Offline, Push Notifications, Service Worker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
