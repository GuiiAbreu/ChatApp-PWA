"use client"

import { useEffect, useState } from "react"

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Initialize with current status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      console.log("[v0] Network connection restored")
      setIsOnline(true)
      setWasOffline(true)

      // Reset wasOffline after a delay to show sync notification
      setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      console.log("[v0] Network connection lost")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}
