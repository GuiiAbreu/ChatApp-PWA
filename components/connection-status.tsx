"use client"

import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting: boolean
  className?: string
}

export function ConnectionStatus({ isConnected, isConnecting, className }: ConnectionStatusProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {isConnecting ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="w-3 h-3 text-green-500" />
          <span className="text-green-500">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-destructive" />
          <span className="text-destructive">Disconnected</span>
        </>
      )}
    </div>
  )
}
