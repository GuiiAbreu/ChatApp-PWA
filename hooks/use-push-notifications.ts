"use client"

import { useEffect, useState } from "react"
import { pushManager } from "@/lib/push-notifications"

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSupport = async () => {
      const supported = pushManager.isSupported()
      setIsSupported(supported)

      if (supported) {
        setPermission(Notification.permission)

        // Initialize push manager
        const initialized = await pushManager.initialize()
        if (initialized) {
          const subscription = pushManager.getSubscription()
          setIsSubscribed(!!subscription)
        }
      }
    }

    checkSupport()
  }, [])

  const requestPermission = async () => {
    setIsLoading(true)
    try {
      const newPermission = await pushManager.requestPermission()
      setPermission(newPermission)
      return newPermission === "granted"
    } finally {
      setIsLoading(false)
    }
  }

  const subscribe = async () => {
    setIsLoading(true)
    try {
      const subscription = await pushManager.subscribeToPush()
      setIsSubscribed(!!subscription)
      return !!subscription
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)
    try {
      const success = await pushManager.unsubscribeFromPush()
      if (success) {
        setIsSubscribed(false)
      }
      return success
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = async (title: string, body: string, data?: any) => {
    await pushManager.showLocalNotification({
      title,
      body,
      tag: "chat-message",
      data,
    })
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  }
}
