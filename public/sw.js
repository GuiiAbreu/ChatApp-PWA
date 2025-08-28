const CACHE_VERSION = "v2"
const STATIC_CACHE = `chatapp-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `chatapp-dynamic-${CACHE_VERSION}`
const API_CACHE = `chatapp-api-${CACHE_VERSION}`
const IMAGE_CACHE = `chatapp-images-${CACHE_VERSION}`

// Static resources to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico",
  "/offline.html", // Offline fallback page
]

// Cache size limits
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [API_CACHE]: 30,
  [IMAGE_CACHE]: 60,
}

// Install event - cache static resources
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker v2")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker v2")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (cacheName.startsWith("chatapp-") && !cacheName.includes(CACHE_VERSION)) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Enhanced fetch event with multiple caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE))
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
  } else if (isNavigationRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE))
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  }
})

// Cache-first strategy (for static assets)
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
      await limitCacheSize(cacheName)
    }
    return networkResponse
  } catch (error) {
    console.error("[SW] Cache-first failed:", error)
    return getOfflineFallback(request)
  }
}

// Network-first strategy (for API calls and dynamic content)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
      await limitCacheSize(cacheName)
    }
    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return getOfflineFallback(request)
  }
}

// Stale-while-revalidate strategy (for navigation requests)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
        limitCacheSize(cacheName)
      }
      return networkResponse
    })
    .catch(() => {
      // Network failed, return cached version if available
      return cachedResponse
    })

  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise
}

// Helper functions to identify request types
function isStaticAsset(request) {
  const url = new URL(request.url)
  return STATIC_ASSETS.some((asset) => url.pathname === asset) || url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/)
}

function isAPIRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith("/api/") || url.hostname !== self.location.hostname
}

function isImageRequest(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)
}

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept").includes("text/html"))
  )
}

// Limit cache size to prevent storage bloat
async function limitCacheSize(cacheName) {
  const limit = CACHE_LIMITS[cacheName]
  if (!limit) return

  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > limit) {
    // Remove oldest entries (FIFO)
    const keysToDelete = keys.slice(0, keys.length - limit)
    await Promise.all(keysToDelete.map((key) => cache.delete(key)))
    console.log(`[SW] Cleaned ${keysToDelete.length} entries from ${cacheName}`)
  }
}

// Offline fallback responses
async function getOfflineFallback(request) {
  if (isNavigationRequest(request)) {
    // Return offline page for navigation requests
    const offlinePage = await caches.match("/offline.html")
    if (offlinePage) return offlinePage

    // Fallback to main page if offline page not available
    return caches.match("/")
  }

  if (isImageRequest(request)) {
    // Return placeholder for images
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Offline</text></svg>',
      { headers: { "Content-Type": "image/svg+xml" } },
    )
  }

  // Generic offline response
  return new Response("Offline", {
    status: 503,
    statusText: "Service Unavailable",
    headers: { "Content-Type": "text/plain" },
  })
}

// Enhanced background sync with retry logic
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync event:", event.tag)

  if (event.tag === "sync-messages") {
    event.waitUntil(syncOfflineMessages())
  } else if (event.tag === "cleanup-caches") {
    event.waitUntil(cleanupCaches())
  }
})

async function syncOfflineMessages() {
  try {
    console.log("[SW] Syncing offline messages")

    // Get offline messages from IndexedDB or localStorage
    const clients = await self.clients.matchAll()

    // Request sync from clients
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_REQUEST",
        timestamp: Date.now(),
      })
    })

    // Simulate sync delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Notify clients that sync is complete
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        timestamp: Date.now(),
      })
    })

    console.log("[SW] Message sync completed")
  } catch (error) {
    console.error("[SW] Failed to sync messages:", error)
    throw error // This will cause the sync to be retried
  }
}

async function cleanupCaches() {
  try {
    console.log("[SW] Cleaning up caches")

    // Clean up each cache according to its limits
    for (const [cacheName, limit] of Object.entries(CACHE_LIMITS)) {
      await limitCacheSize(cacheName)
    }

    console.log("[SW] Cache cleanup completed")
  } catch (error) {
    console.error("[SW] Cache cleanup failed:", error)
  }
}

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received")

  let notificationData = {
    title: "New Message",
    body: "You have a new message in ChatApp",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "chat-message",
    data: {
      url: "/",
    },
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = { ...notificationData, ...payload }
    } catch (error) {
      console.error("[SW] Failed to parse push data:", error)
    }
  }

  const promiseChain = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: false,
    actions: [
      {
        action: "open",
        title: "Open Chat",
        icon: "/icon-192.png",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
  })

  event.waitUntil(promiseChain)
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked")

  event.notification.close()

  if (event.action === "close") {
    return
  }

  // Open or focus the app
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }

      // Open new window if app is not open
      if (clients.openWindow) {
        const url = event.notification.data?.url || "/"
        return clients.openWindow(url)
      }
    })

  event.waitUntil(promiseChain)
})
