import type React from "react"
import MobileHeader from "./mobile-header"
import BottomNav from "./bottom-nav"
import AppFooter from "./app-footer"

export default function MobileLayout({
  children,
  activeTab,
}: {
  children: React.ReactNode
  activeTab: string
}) {
  return (
    <div className="w-full max-w-[420px] mx-auto bg-[#111116] text-white font-sans overflow-hidden flex flex-col h-screen">
      <MobileHeader />
      <main className="flex-grow overflow-y-auto">
        {children}
        <AppFooter />
      </main>
      <BottomNav activeTab={activeTab} />
    </div>
  )
}
