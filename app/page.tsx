"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, Send, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWebSocket } from "@/hooks/use-websocket"
import { ChatMessages } from "@/components/chat-messages"
import { ConnectionStatus } from "@/components/connection-status"
import { OfflineIndicator } from "@/components/offline-indicator"
import { NotificationSettings } from "@/components/notification-settings"
import { PWAInstallBanner } from "@/components/pwa-install-banner"
import { PWASettings } from "@/components/pwa-settings"

export default function HomePage() {
  const [selectedWorkspace, setSelectedWorkspace] = useState("Select workspace...")
  const [message, setMessage] = useState("")

  const { messages, isConnected, isConnecting, isOnline, syncingMessages, wasOffline, sendMessage } = useWebSocket()

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PWAInstallBanner />

      <div className="flex flex-1">
        <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
          {/* Workspace Selector */}
          <div className="p-4 border-b border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent/10"
            >
              <span>{selectedWorkspace}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4 border-b border-sidebar-border">
            <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-10 bg-input border-border text-foreground" />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 p-4">
            <div className="text-center text-muted-foreground italic py-8">No chats.</div>
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start text-sidebar-foreground hover:bg-sidebar-accent/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="flex items-center gap-1">
                <NotificationSettings />
                <PWASettings />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold">Quick Settings</h2>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-4">
              <ConnectionStatus isConnected={isConnected} isConnecting={isConnecting} />
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">GPT-4 Turbo</span>
                <Settings className="w-4 h-4" />
              </div>
            </div>
          </div>

          {(!isOnline || syncingMessages || wasOffline) && (
            <div className="px-6 py-2 border-b border-border">
              <OfflineIndicator isOnline={isOnline} syncingMessages={syncingMessages} wasOffline={wasOffline} />
            </div>
          )}

          <ChatMessages messages={messages} className="flex-1" />

          {/* Message Input */}
          <div className="p-6 border-t border-border">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="flex items-center space-x-2 bg-input rounded-full border border-border p-2">
                  <div className="flex-1 flex items-center space-x-3 px-4">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Send a message..."
                      className="border-0 bg-transparent focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground"
                      disabled={!isOnline && !isConnected}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
