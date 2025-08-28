"use client"

import { WifiOff, Wifi, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OfflineIndicatorProps {
  isOnline: boolean
  syncingMessages: boolean
  wasOffline: boolean
  className?: string
}

export function OfflineIndicator({ isOnline, syncingMessages, wasOffline, className }: OfflineIndicatorProps) {
  if (isOnline && !syncingMessages && !wasOffline) {
    return null // Don't show anything when everything is normal
  }

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium", className)}>
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 text-destructive" />
          <span className="text-destructive">Offline - Messages will sync when connected</span>
        </>
      ) : syncingMessages ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-primary">Syncing messages...</span>
        </>
      ) : wasOffline ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-500">Back online - Messages synced</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-green-500">Connected</span>
        </>
      )}
    </div>
  )
}
