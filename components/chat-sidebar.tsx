"use client"
import { Plus, Search, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatSidebarProps {
  selectedWorkspace: string
  onWorkspaceChange: (workspace: string) => void
}

export function ChatSidebar({ selectedWorkspace, onWorkspaceChange }: ChatSidebarProps) {
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Workspace Selector */}
      <div className="p-4 border-b border-sidebar-border">
        <Button variant="ghost" className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent/10">
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
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}
