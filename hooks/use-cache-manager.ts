"use client"

import { useEffect, useState } from "react"
import { cacheManager } from "@/lib/cache-manager"

export function useCacheManager() {
  const [cacheSize, setCacheSize] = useState(0)
  const [isPersistent, setIsPersistent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const updateCacheInfo = async () => {
      const size = await cacheManager.getCacheSize()
      setCacheSize(size)
    }

    updateCacheInfo()

    // Update cache size periodically
    const interval = setInterval(updateCacheInfo, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const clearCaches = async () => {
    setIsLoading(true)
    try {
      await cacheManager.clearAllCaches()
      setCacheSize(0)
    } finally {
      setIsLoading(false)
    }
  }

  const requestPersistentStorage = async () => {
    setIsLoading(true)
    try {
      const persistent = await cacheManager.requestPersistentStorage()
      setIsPersistent(persistent)
      return persistent
    } finally {
      setIsLoading(false)
    }
  }

  const scheduleSync = async (tag: string) => {
    await cacheManager.scheduleBackgroundSync(tag)
  }

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return {
    cacheSize: formatCacheSize(cacheSize),
    isPersistent,
    isLoading,
    clearCaches,
    requestPersistentStorage,
    scheduleSync,
  }
}
