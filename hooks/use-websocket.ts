"use client"

import { useEffect, useState } from "react"
import { wsManager, type ChatState } from "@/lib/websocket"
import { useOffline } from "./use-offline"

export function useWebSocket() {
  const [state, setState] = useState<ChatState>(() => wsManager.getState())
  const { isOnline, wasOffline } = useOffline()

  useEffect(() => {
    const unsubscribe = wsManager.subscribe((newState) => {
      setState({ ...newState, isOnline })
    })

    // Connect on mount if online
    if (isOnline) {
      wsManager.connect()
    }

    return () => {
      unsubscribe()
      wsManager.disconnect()
    }
  }, [isOnline])

  const sendMessage = (content: string) => {
    if (content.trim()) {
      wsManager.sendMessage(content.trim())
    }
  }

  return {
    ...state,
    isOnline,
    wasOffline,
    sendMessage,
    connect: () => wsManager.connect(),
    disconnect: () => wsManager.disconnect(),
  }
}
