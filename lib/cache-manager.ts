export class CacheManager {
  private static instance: CacheManager

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async clearAllCaches(): Promise<void> {
    if (!("caches" in window)) return

    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      console.log("[v0] All caches cleared")
    } catch (error) {
      console.error("[v0] Failed to clear caches:", error)
    }
  }

  async getCacheSize(): Promise<number> {
    if (!("caches" in window) || !("storage" in navigator) || !("estimate" in navigator.storage)) {
      return 0
    }

    try {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    } catch (error) {
      console.error("[v0] Failed to get cache size:", error)
      return 0
    }
  }

  async requestPersistentStorage(): Promise<boolean> {
    if (!("storage" in navigator) || !("persist" in navigator.storage)) {
      return false
    }

    try {
      const persistent = await navigator.storage.persist()
      console.log(`[v0] Persistent storage: ${persistent}`)
      return persistent
    } catch (error) {
      console.error("[v0] Failed to request persistent storage:", error)
      return false
    }
  }

  async scheduleBackgroundSync(tag: string): Promise<void> {
    if (!("serviceWorker" in navigator) || !("sync" in window.ServiceWorkerRegistration.prototype)) {
      console.warn("[v0] Background sync not supported")
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      console.log(`[v0] Background sync scheduled: ${tag}`)
    } catch (error) {
      console.error("[v0] Failed to schedule background sync:", error)
    }
  }

  async preloadCriticalResources(urls: string[]): Promise<void> {
    if (!("caches" in window)) return

    try {
      const cache = await caches.open("chatapp-preload")
      await Promise.all(
        urls.map(async (url) => {
          try {
            const response = await fetch(url)
            if (response.ok) {
              await cache.put(url, response)
            }
          } catch (error) {
            console.warn(`[v0] Failed to preload: ${url}`, error)
          }
        }),
      )
      console.log("[v0] Critical resources preloaded")
    } catch (error) {
      console.error("[v0] Failed to preload resources:", error)
    }
  }
}

export const cacheManager = CacheManager.getInstance()
