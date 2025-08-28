import { ChevronDown, Settings } from "lucide-react"

export function ChatHeader() {
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold">Quick Settings</h2>
        <ChevronDown className="w-4 h-4" />
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">GPT-4 Turbo</span>
        <Settings className="w-4 h-4" />
      </div>
    </div>
  )
}
