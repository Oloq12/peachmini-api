"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const characters = [
  {
    emoji: "😇",
    name: "Lila",
    age: 22,
    personality: "Милая и невинная",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    emoji: "😈",
    name: "Roxy",
    age: 24,
    personality: "Дерзкая и игривая",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    emoji: "🧠",
    name: "Elara",
    age: 26,
    personality: "Умная и загадочная",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    emoji: "🎨",
    name: "Chloe",
    age: 21,
    personality: "Творческая и мечтательная",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    emoji: "🔥",
    name: "Seraphina",
    age: 25,
    personality: "Страстная и уверенная",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    emoji: "😊",
    name: "Mia",
    age: 23,
    personality: "Добрая и заботливая",
    image: "/placeholder.svg?height=400&width=300",
  },
]

const CharacterCard = ({ character, rotation, zIndex, isCenter }) => (
  <div
    className="absolute w-48 h-72 transition-transform duration-500 ease-out"
    style={{
      transform: `rotateY(${rotation}deg) translateZ(200px)`,
      zIndex: zIndex,
    }}
  >
    <div
      className={cn(
        "relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500",
        isCenter ? "shadow-2xl shadow-pink-500/30 scale-105" : "shadow-lg",
      )}
    >
      <Image
        src={character.image || "/placeholder.svg"}
        alt={character.name}
        layout="fill"
        objectFit="cover"
        className="opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3 text-white">
        <p className="text-xl">{character.emoji}</p>
        <h3 className="text-xl font-bold mt-1">
          {character.name}, <span className="font-light">{character.age}</span>
        </h3>
        <p className="text-xs text-gray-300 mt-1">{character.personality}</p>
      </div>
    </div>
  </div>
)

export default function CharacterGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const totalCharacters = characters.length
  const angle = 360 / totalCharacters

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalCharacters)
    }, 3000)
    return () => clearInterval(interval)
  }, [totalCharacters])

  return (
    <div className="w-full h-[360px] flex items-center justify-center relative my-2">
      <div className="relative w-full h-72" style={{ perspective: "1000px" }}>
        <div
          className="absolute w-full h-full transition-transform duration-1000 ease-in-out"
          style={{ transformStyle: "preserve-3d", transform: `rotateY(${-activeIndex * angle}deg)` }}
        >
          {characters.map((char, index) => {
            const rotation = index * angle
            const isCenter = index === activeIndex
            const zDist = Math.abs(index - activeIndex)
            const zIndex = totalCharacters - Math.min(zDist, totalCharacters - zDist)
            return (
              <CharacterCard key={char.name} character={char} rotation={rotation} zIndex={zIndex} isCenter={isCenter} />
            )
          })}
        </div>
      </div>
    </div>
  )
}
