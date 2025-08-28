import type { Message } from "./websocket"

export interface OfflineMessage extends Message {
  synced: boolean
  queuedAt: Date
}

export class OfflineStorage {
  private readonly STORAGE_KEY = "chatapp_offline_messages"
  private readonly SETTINGS_KEY = "chatapp_settings"

  // Store messages locally when offline
  storeMessage(message: Message): void {
    const offlineMessage: OfflineMessage = {
      ...message,
      synced: false,
      queuedAt: new Date(),
    }

    const messages = this.getOfflineMessages()
    messages.push(offlineMessage)

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages))
    } catch (error) {
      console.error("[v0] Failed to store offline message:", error)
    }
  }

  // Get all offline messages
  getOfflineMessages(): OfflineMessage[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("[v0] Failed to retrieve offline messages:", error)
      return []
    }
  }

  // Get unsynced messages for sync when online
  getUnsyncedMessages(): OfflineMessage[] {
    return this.getOfflineMessages().filter((msg) => !msg.synced)
  }

  // Mark messages as synced
  markMessagesSynced(messageIds: string[]): void {
    const messages = this.getOfflineMessages()
    const updatedMessages = messages.map((msg) => (messageIds.includes(msg.id) ? { ...msg, synced: true } : msg))

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMessages))
    } catch (error) {
      console.error("[v0] Failed to mark messages as synced:", error)
    }
  }

  // Clear old synced messages (keep last 100)
  cleanupSyncedMessages(): void {
    const messages = this.getOfflineMessages()
    const unsyncedMessages = messages.filter((msg) => !msg.synced)
    const syncedMessages = messages.filter((msg) => msg.synced).slice(-100)

    const cleanedMessages = [...unsyncedMessages, ...syncedMessages]

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedMessages))
    } catch (error) {
      console.error("[v0] Failed to cleanup messages:", error)
    }
  }

  // Store app settings
  storeSettings(settings: Record<string, any>): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("[v0] Failed to store settings:", error)
    }
  }

  // Get app settings
  getSettings(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("[v0] Failed to retrieve settings:", error)
      return {}
    }
  }
}

export const offlineStorage = new OfflineStorage()
