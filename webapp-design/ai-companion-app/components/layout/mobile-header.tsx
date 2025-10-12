import Link from "next/link"

export default function MobileHeader({ title }: { title?: string }) {
  return (
    <header className="flex items-center justify-center p-4 flex-shrink-0 bg-gradient-to-b from-black/50 to-transparent">
      <Link href="/">
        <div className="text-2xl font-bold text-white cursor-pointer">
          🍑 Peach
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f093fb] to-[#667eea]">Mini</span>
        </div>
      </Link>
    </header>
  )
}
