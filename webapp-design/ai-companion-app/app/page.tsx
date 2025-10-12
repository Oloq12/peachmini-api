import MobileLayout from "@/components/layout/mobile-layout"
import CharacterGallery from "@/components/character-gallery"
import { Button } from "@/components/ui/button"
import { Fish } from "lucide-react"
import CharacterCatalog from "@/components/character-catalog"

export default function HomePage() {
  return (
    <MobileLayout activeTab="home">
      <div className="flex flex-col">
        <div className="text-center pt-4">
          <h1 className="text-3xl font-bold text-white">Найди свою пару</h1>
          <p className="text-gray-400 mt-2">Начни общаться с AI-компаньонами</p>
        </div>

        <CharacterGallery />

        <div className="px-4 my-6">
          <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#f093fb] to-[#667eea] hover:opacity-90 transition-opacity rounded-2xl text-white">
            <Fish className="w-6 h-6 mr-3" />
            Создайте своего спутника
          </Button>
        </div>

        <CharacterCatalog />
      </div>
    </MobileLayout>
  )
}
