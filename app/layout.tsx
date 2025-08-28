import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "ChatApp PWA",
  description: "Real-time chat application with offline support and push notifications",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["chat", "real-time", "pwa", "offline", "websocket"],
  authors: [{ name: "ChatApp Team" }],
  creator: "ChatApp Team",
  publisher: "ChatApp Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://chatapp-pwa.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChatApp PWA",
    description: "Real-time chat application with offline support",
    url: "https://chatapp-pwa.vercel.app",
    siteName: "ChatApp PWA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatApp PWA",
    description: "Real-time chat application with offline support",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#6366f1",
  colorScheme: "dark",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChatApp PWA",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ChatApp PWA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
