"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MessageInputProps {
  onSendMessage: (message: string) => void
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
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
              />
            </div>
            <Button
              onClick={handleSend}
              size="sm"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
