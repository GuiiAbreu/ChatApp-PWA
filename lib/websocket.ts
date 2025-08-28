import { offlineStorage } from "./offline-storage"
import { pushManager } from "./push-notifications"
import { MockWebSocket } from "./mock-websocket"

export interface Message {
  id: string
  content: string
  timestamp: Date
  sender: string
  type: "user" | "system"
}

export interface ChatState {
  messages: Message[]
  isConnected: boolean
  isConnecting: boolean
  isOnline: boolean
  syncingMessages: boolean
}

export class WebSocketManager {
  private ws: WebSocket | MockWebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageQueue: string[] = []
  private listeners: Set<(state: ChatState) => void> = new Set()
  private currentState: ChatState = {
    messages: [],
    isConnected: false,
    isConnecting: false,
    isOnline: navigator?.onLine ?? true,
    syncingMessages: false,
  }

  constructor(private url: string) {
    // Load offline messages on initialization
    this.loadOfflineMessages()

    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline.bind(this))
      window.addEventListener("offline", this.handleOffline.bind(this))
    }

    this.initializePushNotifications()
  }

  private async initializePushNotifications() {
    try {
      const initialized = await pushManager.initialize()
      if (initialized) {
        console.log("[v0] Push notifications initialized successfully")
      } else {
        console.log("[v0] Push notifications not available in this environment")
      }
    } catch (error) {
      console.warn("[v0] Push notifications initialization failed, continuing without notifications:", error)
    }
  }

  private loadOfflineMessages() {
    const offlineMessages = offlineStorage.getOfflineMessages()
    this.currentState.messages = offlineMessages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      sender: msg.sender,
      type: msg.synced ? msg.type : "system",
    }))
    this.notifyListeners()
  }

  private handleOnline() {
    console.log("[v0] Device came online")
    this.updateState({ isOnline: true })
    this.syncOfflineMessages()

    // Attempt to reconnect WebSocket
    if (!this.currentState.isConnected && !this.currentState.isConnecting) {
      this.connect()
    }
  }

  private handleOffline() {
    console.log("[v0] Device went offline")
    this.updateState({ isOnline: false })
  }

  private async syncOfflineMessages() {
    const unsyncedMessages = offlineStorage.getUnsyncedMessages()

    if (unsyncedMessages.length === 0) return

    console.log(`[v0] Syncing ${unsyncedMessages.length} offline messages`)
    this.updateState({ syncingMessages: true })

    try {
      // Simulate sync process - in real app, send to server
      for (const message of unsyncedMessages) {
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === MockWebSocket.OPEN) {
          this.ws.send(JSON.stringify(message))
        }
      }

      // Mark messages as synced
      const messageIds = unsyncedMessages.map((msg) => msg.id)
      offlineStorage.markMessagesSynced(messageIds)

      // Update local state
      this.loadOfflineMessages()

      console.log("[v0] Offline messages synced successfully")
    } catch (error) {
      console.error("[v0] Failed to sync offline messages:", error)
    } finally {
      this.updateState({ syncingMessages: false })
      offlineStorage.cleanupSyncedMessages()
    }
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === MockWebSocket.OPEN) return

    this.updateState({ isConnecting: true })

    try {
      const isPreviewEnvironment =
        typeof window !== "undefined" &&
        (window.location.hostname.includes("vusercontent.net") ||
          window.location.hostname.includes("localhost") ||
          window.location.hostname.includes("127.0.0.1") ||
          process.env.NODE_ENV === "development")

      if (isPreviewEnvironment) {
        console.log("[v0] Using mock WebSocket for demo purposes")
        this.ws = new MockWebSocket(this.url, {
          autoRespond: true,
          responseDelay: 1500,
        })
      } else {
        this.ws = new WebSocket(this.url)
      }

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0
        this.updateState({ isConnected: true, isConnecting: false })

        // Sync offline messages when connection is established
        if (this.currentState.isOnline) {
          this.syncOfflineMessages()
        }

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift()
          if (message) this.ws?.send(message)
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data)
          this.addMessage(message, true) // Mark as synced
        } catch (error) {
          console.error("[v0] Failed to parse message:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("[v0] WebSocket disconnected")
        this.updateState({ isConnected: false, isConnecting: false })
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.warn("[v0] WebSocket connection failed, this is expected in preview environments:", error)
        this.updateState({ isConnecting: false })

        const isPreviewEnvironment =
          typeof window !== "undefined" &&
          (window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("localhost"))

        if (!isPreviewEnvironment) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error("[v0] Failed to create WebSocket:", error)
      this.updateState({ isConnecting: false })
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.updateState({ isConnected: false, isConnecting: false })
  }

  sendMessage(content: string, sender = "user") {
    const message: Message = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date(),
      sender,
      type: "user",
    }

    // Always store message locally first
    offlineStorage.storeMessage(message)
    this.addMessage(message, false) // Mark as unsynced initially

    const messageData = JSON.stringify(message)

    if (
      (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === MockWebSocket.OPEN) &&
      this.currentState.isOnline
    ) {
      // Send immediately if connected and online
      this.ws.send(messageData)
      offlineStorage.markMessagesSynced([message.id])
    } else {
      // Queue for later if offline or disconnected
      this.messageQueue.push(messageData)

      // Try to reconnect if online but not connected
      if (this.currentState.isOnline && !this.currentState.isConnecting) {
        this.connect()
      }
    }
  }

  private addMessage(message: Message, synced = false) {
    // Check if message already exists to avoid duplicates
    const existingIndex = this.currentState.messages.findIndex((m) => m.id === message.id)

    if (existingIndex >= 0) {
      // Update existing message
      this.currentState.messages[existingIndex] = {
        ...message,
        type: synced ? message.type : "system",
      }
    } else {
      // Add new message
      this.currentState.messages.push({
        ...message,
        type: synced ? message.type : "system",
      })

      if (message.sender !== "user" && synced && document.hidden) {
        this.showMessageNotification(message)
      }
    }

    this.notifyListeners()
  }

  private async showMessageNotification(message: Message) {
    try {
      if (!pushManager.isSupported()) {
        console.log("[v0] Notifications not supported, skipping notification")
        return
      }

      await pushManager.showLocalNotification({
        title: `New message from ${message.sender}`,
        body: message.content,
        tag: "chat-message",
        data: {
          messageId: message.id,
          sender: message.sender,
        },
      })
    } catch (error) {
      console.warn("[v0] Failed to show notification, continuing without:", error)
    }
  }

  private updateState(updates: Partial<ChatState>) {
    this.currentState = { ...this.currentState, ...updates }
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.currentState }))
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.currentState.isOnline) {
      console.log("[v0] Max reconnection attempts reached or offline")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[v0] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      if (!this.currentState.isConnected && this.currentState.isOnline) {
        this.connect()
      }
    }, delay)
  }

  subscribe(listener: (state: ChatState) => void) {
    this.listeners.add(listener)
    listener({ ...this.currentState })

    return () => {
      this.listeners.delete(listener)
    }
  }

  getState() {
    return { ...this.currentState }
  }
}

// Singleton instance
export const wsManager = new WebSocketManager(
  process.env.NODE_ENV === "development" ? "ws://localhost:8080" : "wss://your-websocket-server.com",
)
