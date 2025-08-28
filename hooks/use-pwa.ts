"use client"

import { useEffect, useState } from "react"
import { pwaManager, type PWAStatus } from "@/lib/pwa-manager"

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>(() => pwaManager.getStatus())
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    const unsubscribe = pwaManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  const installApp = async () => {
    setIsInstalling(true)
    try {
      const success = await pwaManager.installApp()
      return success
    } finally {
      setIsInstalling(false)
    }
  }

  const shareApp = async () => {
    return pwaManager.shareContent({
      title: "ChatApp PWA",
      text: "Check out this amazing real-time chat application!",
      url: window.location.origin,
    })
  }

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      return pwaManager.exitFullscreen()
    } else {
      return pwaManager.requestFullscreen()
    }
  }

  return {
    ...status,
    isInstalling,
    installApp,
    shareApp,
    toggleFullscreen,
  }
}
