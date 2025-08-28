"use client"

import { useState } from "react"
import { Download, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePWA } from "@/hooks/use-pwa"

export function PWAInstallBanner() {
  const [isDismissed, setIsDismissed] = useState(false)
  const { canInstall, isInstalling, installApp } = usePWA()

  if (!canInstall || isDismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsDismissed(true)
    }
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Install ChatApp</h3>
            <p className="text-xs text-muted-foreground">Get the full app experience with offline support</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstall} disabled={isInstalling} className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            {isInstalling ? "Installing..." : "Install"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsDismissed(true)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
