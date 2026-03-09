"use client"

import { useState } from "react"
import { Link2 } from "lucide-react"
import { ConnectPlatformsModal } from "./ConnectPlatformsModal"

export function ConnectPlatformsButton({ connectedPlatforms }: { connectedPlatforms: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 bg-indigo-600/20 text-indigo-100 hover:text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-600/40 border border-white/10 transition shadow-sm"
      >
        <Link2 className="w-4 h-4" />
        Connect Platforms
      </button>

      <ConnectPlatformsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        connectedPlatforms={connectedPlatforms}
      />
    </>
  )
}
