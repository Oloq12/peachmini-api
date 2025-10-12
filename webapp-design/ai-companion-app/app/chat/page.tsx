import Image from "next/image"
import { Mic } from "lucide-react"
import MobileLayout from "@/components/layout/mobile-layout"
import { Card } from "@/components/ui/card"

const chatData = [
  {
    name: "Vera Marquette",
    age: 24,
    avatar: "/placeholder.svg?height=56&width=56",
    lastMessage: "Ого, это довольно экстравагантное ув...",
    hasVoice: false,
  },
  {
    name: "Elara Nightshade",
    age: 23,
    avatar: "/placeholder.svg?height=56&width=56",
    lastMessage: "Привет, я наблюдала за тобой. Готова ...",
    hasVoice: true,
  },
]

const ChatItem = ({ name, age, avatar, lastMessage, hasVoice }: (typeof chatData)[0]) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-lg p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors">
    <div className="relative w-14 h-14 flex-shrink-0">
      <Image src={avatar || "/placeholder.svg"} alt={name} width={56} height={56} className="rounded-full" />
    </div>
    <div className="flex-grow overflow-hidden">
      <h3 className="font-bold text-base">
        {name} <span className="font-light text-gray-400">{age}</span>
      </h3>
      <div className="flex items-center gap-2 text-sm text-gray-400 truncate">
        {hasVoice && <Mic className="w-4 h-4 flex-shrink-0" />}
        <p className="truncate">{lastMessage}</p>
      </div>
    </div>
  </Card>
)

export default function ChatPage() {
  return (
    <MobileLayout activeTab="chat" headerTitle="Чат">
      <div className="space-y-4">
        {chatData.map((chat, index) => (
          <ChatItem key={index} {...chat} />
        ))}
      </div>
    </MobileLayout>
  )
}
