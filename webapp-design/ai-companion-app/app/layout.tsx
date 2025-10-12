import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "🍑 PeachMini",
  description: "Найди свою AI-пару",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={cn("font-sans bg-[#111116] text-white", inter.variable)}>{children}</body>
    </html>
  )
}
