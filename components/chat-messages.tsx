"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/lib/websocket"
import { cn } from "@/lib/utils"

interface ChatMessagesProps {
  messages: Message[]
  className?: string
}

export function ChatMessages({ messages, className }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">UI</span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Chatbot UI</h2>
          <p className="text-muted-foreground">Start a conversation to begin chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", className)}>
      {messages.map((message) => (
        <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[70%] rounded-lg px-4 py-2 text-sm",
              message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              message.type === "system" && "bg-destructive/10 text-destructive border border-destructive/20",
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <div className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
              {message.type === "system" && " (queued)"}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
