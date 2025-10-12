"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, Fish } from "lucide-react"

const catalogCharacters = [
  // Anime
  { name: "Lila", age: 18, image: "/placeholder.svg?height=240&width=180", tag: "Аниме" },
  { name: "Aria", age: 25, image: "/placeholder.svg?height=240&width=180", tag: "Аниме" },
  { name: "Kiana", age: 37, image: "/placeholder.svg?height=240&width=180", tag: "Аниме" },
  { name: "Miki", age: 20, image: "/placeholder.svg?height=240&width=180", tag: "Аниме" },
  { name: "Yuna", age: 22, image: "/placeholder.svg?height=240&width=180", tag: "Аниме" },
  // Real
  { name: "Serena", age: 28, image: "/placeholder.svg?height=240&width=180", tag: "Реальный" },
  { name: "Chloe", age: 24, image: "/placeholder.svg?height=240&width=180", tag: "Реальный" },
  { name: "Isabella", age: 26, image: "/placeholder.svg?height=240&width=180", tag: "Реальный" },
  { name: "Zoe", age: 21, image: "/placeholder.svg?height=240&width=180", tag: "Реальный" },
  { name: "Olivia", age: 29, image: "/placeholder.svg?height=240&width=180", tag: "Реальный" },
]

const CatalogCard = ({ character }) => (
  <div className="relative rounded-2xl overflow-hidden group">
    <Image
      src={character.image || "/placeholder.svg"}
      alt={character.name}
      width={180}
      height={240}
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
    <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
      {character.tag}
    </div>
    <div className="absolute bottom-2 left-2 text-white">
      <h3 className="font-bold">
        {character.name} <span className="font-light">{character.age}</span>
      </h3>
    </div>
    <button className="absolute top-2 right-2 w-7 h-7 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
      <Plus className="w-4 h-4" />
    </button>
  </div>
)

const CreateCompanionCard = () => (
  <div className="relative rounded-2xl overflow-hidden group cursor-pointer border border-dashed border-white/20 hover:border-pink-500 transition-colors">
    <Image
      src="/placeholder.svg?height=240&width=180"
      alt="Создать спутника"
      width={180}
      height={240}
      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 to-purple-900/50" />
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
      <Fish className="w-12 h-12 text-pink-400" />
      <h3 className="font-bold text-lg mt-2">Создайте своего спутника</h3>
    </div>
  </div>
)

export default function CharacterCatalog() {
  const [activeFilter, setActiveFilter] = useState("Все модели")
  const filters = ["Все модели", "Реальный", "Аниме"]

  const filteredCharacters =
    activeFilter === "Все модели" ? catalogCharacters : catalogCharacters.filter((c) => c.tag === activeFilter)

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 mb-4">
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            variant="ghost"
            className={cn(
              "rounded-full transition-colors",
              activeFilter === filter
                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20",
            )}
          >
            {filter}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CreateCompanionCard />
        {filteredCharacters.map((char) => (
          <CatalogCard key={char.name} character={char} />
        ))}
      </div>
    </div>
  )
}
