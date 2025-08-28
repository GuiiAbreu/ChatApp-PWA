export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  async initialize(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("[v0] Push notifications not supported")
      return false
    }

    try {
      // Check if we're in a development/preview environment where service workers might not work
      const isPreviewEnvironment =
        window.location.hostname.includes("vusercontent.net") ||
        window.location.hostname.includes("localhost") ||
        window.location.protocol !== "https:"

      if (isPreviewEnvironment) {
        console.warn("[v0] Service worker registration skipped in preview environment")
        return false
      }

      // Register service worker with better error handling
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })
      console.log("[v0] Service worker registered for push notifications")

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      return true
    } catch (error) {
      console.warn("[v0] Service worker registration failed, continuing without push notifications:", error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("[v0] Notifications not supported")
      return "denied"
    }

    let permission = Notification.permission

    if (permission === "default") {
      permission = await Notification.requestPermission()
    }

    console.log(`[v0] Notification permission: ${permission}`)
    return permission
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error("[v0] Service worker not registered")
      return null
    }

    const permission = await this.requestPermission()
    if (permission !== "granted") {
      console.warn("[v0] Notification permission not granted")
      return null
    }

    try {
      // Check for existing subscription
      this.subscription = await this.registration.pushManager.getSubscription()

      if (!this.subscription) {
        // Create new subscription
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
              "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmqmkFWJ6swkuHdgBUrNiOOHY4mOYgZ9YpmIFRNKMWdA",
          ),
        })

        console.log("[v0] Push subscription created")
      }

      // Send subscription to server (in real app)
      await this.sendSubscriptionToServer(this.subscription)

      return this.subscription
    } catch (error) {
      console.error("[v0] Failed to subscribe to push notifications:", error)
      return null
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }

    try {
      await this.subscription.unsubscribe()
      this.subscription = null
      console.log("[v0] Unsubscribed from push notifications")
      return true
    } catch (error) {
      console.error("[v0] Failed to unsubscribe from push notifications:", error)
      return false
    }
  }

  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    const permission = await this.requestPermission()
    if (permission !== "granted") {
      return
    }

    try {
      if (this.registration) {
        // Use service worker to show notification
        await this.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/icon-192.png",
          badge: payload.badge || "/icon-192.png",
          tag: payload.tag,
          data: payload.data,
          requireInteraction: false,
          silent: false,
        })
      } else {
        // Fallback to browser notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/icon-192.png",
          badge: payload.badge || "/icon-192.png",
          tag: payload.tag,
          data: payload.data,
        })
      }
    } catch (error) {
      console.warn("[v0] Failed to show notification:", error)
      // Try browser notification as final fallback
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/icon-192.png",
        })
      } catch (fallbackError) {
        console.warn("[v0] All notification methods failed:", fallbackError)
      }
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // In a real app, send this to your server
    console.log("[v0] Push subscription:", JSON.stringify(subscription))

    // Store locally for demo purposes
    localStorage.setItem("push_subscription", JSON.stringify(subscription))
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  getSubscription(): PushSubscription | null {
    return this.subscription
  }

  isSupported(): boolean {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
  }
}

export const pushManager = new PushNotificationManager()
