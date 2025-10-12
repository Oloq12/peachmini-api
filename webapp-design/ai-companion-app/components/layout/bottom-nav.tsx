import Link from "next/link"
import { Home, MessageCircle, Fish, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Домой", href: "/", icon: Home, key: "home" },
  { name: "Чат", href: "/chat", icon: MessageCircle, key: "chat" },
  { name: "Создать", href: "/create", icon: Fish, key: "create" },
  { name: "Сгенерировать", href: "/generate", icon: Sparkles, key: "generate" },
  { name: "Компаньоны", href: "/companions", icon: Star, key: "companions" },
]

export default function BottomNav({ activeTab }: { activeTab: string }) {
  return (
    <footer className="flex items-center justify-around p-2 bg-black/20 backdrop-blur-xl border-t border-white/10 flex-shrink-0">
      {navItems.map((item) => {
        const isActive = activeTab === item.key
        if (item.key === "create") {
          return (
            <Link href={item.href} key={item.key} passHref>
              <Button
                asChild
                className="w-16 h-10 bg-gradient-to-r from-[#f093fb] to-[#667eea] rounded-xl flex flex-col items-center justify-center h-auto text-white shadow-lg shadow-pink-500/20 p-1"
              >
                <a>
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs mt-0.5">{item.name}</span>
                </a>
              </Button>
            </Link>
          )
        }
        return (
          <Link href={item.href} key={item.key} passHref>
            <Button asChild variant="ghost" className="flex flex-col items-center h-auto p-1">
              <a
                className={cn(
                  "flex flex-col items-center",
                  isActive ? "text-pink-400" : "text-gray-400 hover:text-white",
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.name}</span>
                {isActive && <div className="w-1 h-1 bg-pink-400 rounded-full mt-1" />}
              </a>
            </Button>
          </Link>
        )
      })}
    </footer>
  )
}
