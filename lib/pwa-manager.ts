export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export interface PWAStatus {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  canInstall: boolean
  installPrompt: PWAInstallPrompt | null
}

export class PWAManager {
  private static instance: PWAManager
  private installPrompt: PWAInstallPrompt | null = null
  private listeners: Set<(status: PWAStatus) => void> = new Set()

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeEventListeners()
    }
  }

  private initializeEventListeners() {
    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      this.installPrompt = e as any
      console.log("[v0] PWA install prompt available")
      this.notifyListeners()
    })

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      console.log("[v0] PWA installed successfully")
      this.installPrompt = null
      this.notifyListeners()
    })

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    mediaQuery.addEventListener("change", () => {
      console.log("[v0] Display mode changed:", mediaQuery.matches ? "standalone" : "browser")
      this.notifyListeners()
    })
  }

  async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn("[v0] No install prompt available")
      return false
    }

    try {
      await this.installPrompt.prompt()
      const choiceResult = await this.installPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("[v0] User accepted PWA install")
        this.installPrompt = null
        this.notifyListeners()
        return true
      } else {
        console.log("[v0] User dismissed PWA install")
        return false
      }
    } catch (error) {
      console.error("[v0] Failed to install PWA:", error)
      return false
    }
  }

  getStatus(): PWAStatus {
    const isStandalone = this.isStandalone()
    const isInstalled = this.isInstalled()
    const canInstall = !!this.installPrompt && !isInstalled

    return {
      isInstallable: this.isInstallable(),
      isInstalled,
      isStandalone,
      canInstall,
      installPrompt: this.installPrompt,
    }
  }

  private isInstallable(): boolean {
    return "serviceWorker" in navigator && "BeforeInstallPromptEvent" in window
  }

  private isInstalled(): boolean {
    // Check if running as installed PWA
    return this.isStandalone() || this.isInWebApk() || this.isInTWA()
  }

  private isStandalone(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      (window.navigator as any).standalone === true
    )
  }

  private isInWebApk(): boolean {
    return document.referrer.includes("android-app://")
  }

  private isInTWA(): boolean {
    return "getInstalledRelatedApps" in navigator
  }

  subscribe(listener: (status: PWAStatus) => void): () => void {
    this.listeners.add(listener)
    // Immediately call with current status
    listener(this.getStatus())

    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    const status = this.getStatus()
    this.listeners.forEach((listener) => listener(status))
  }

  async shareContent(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!("share" in navigator)) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(data.url || window.location.href)
        return true
      } catch {
        return false
      }
    }

    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.error("[v0] Failed to share:", error)
      return false
    }
  }

  async requestFullscreen(): Promise<boolean> {
    if (!document.fullscreenEnabled) return false

    try {
      await document.documentElement.requestFullscreen()
      return true
    } catch (error) {
      console.error("[v0] Failed to enter fullscreen:", error)
      return false
    }
  }

  async exitFullscreen(): Promise<boolean> {
    if (!document.fullscreenElement) return false

    try {
      await document.exitFullscreen()
      return true
    } catch (error) {
      console.error("[v0] Failed to exit fullscreen:", error)
      return false
    }
  }
}

export const pwaManager = PWAManager.getInstance()
