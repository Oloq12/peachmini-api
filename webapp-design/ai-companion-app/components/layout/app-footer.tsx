import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Fish, Crown } from "lucide-react"

const PeachMiniLogo = () => (
  <div className="text-3xl font-bold text-white cursor-pointer">
    🍑 Peach
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f093fb] to-[#667eea]">Mini</span>
  </div>
)

export default function AppFooter() {
  const footerLinks = {
    Компания: ["Партнерская программа"],
    "Правовые вопросы": [
      "Условия использования",
      "Политика для несовершеннолетних",
      "Политика удаления контента",
      "Политика блокировки контента",
    ],
  }

  return (
    <footer className="bg-[#1C1C24] text-white py-10 px-6 mt-8">
      <div className="flex flex-col items-center text-center">
        <PeachMiniLogo />
        <p className="mt-4 text-lg">Создайте своего идеального Компаньона</p>
        <div className="flex flex-col gap-4 mt-6 w-full max-w-xs">
          <Button className="w-full h-12 text-md font-bold bg-gradient-to-r from-[#f093fb] to-[#667eea] hover:opacity-90 transition-opacity rounded-xl text-white">
            <Fish className="w-5 h-5 mr-2" />
            Создайте своего спутника
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-md font-bold bg-white/5 border-white/20 hover:bg-white/10 rounded-xl"
          >
            <Crown className="w-5 h-5 mr-2 text-yellow-400" />
            Подписка со скидкой 75%
          </Button>
        </div>

        <div className="mt-10 text-left w-full">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="mb-6">
              <h4 className="text-gray-400 mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="hover:text-pink-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
