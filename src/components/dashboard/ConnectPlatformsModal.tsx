"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Youtube, Instagram, Twitter, Video, X, Loader2, CheckCircle2, ShieldCheck } from "lucide-react"
import { signIn } from "next-auth/react"
import { disconnectPlatform } from "@/app/actions/platform"

interface PlatformData {
  id: string
  name: string
  icon: any
  color: string
  description: string
  provider: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'LOADING'
  userName?: string
}

export function ConnectPlatformsModal({ isOpen, onClose, connectedPlatforms }: { isOpen: boolean, onClose: () => void, connectedPlatforms: any[] }) {
  const [platforms, setPlatforms] = useState<PlatformData[]>([
    { id: "youtube", name: "YouTube", icon: Youtube, color: "bg-red-500", description: "Upload shorts and standard videos directly to your channel.", provider: "google", status: "DISCONNECTED" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-600", description: "Publish reels and posts directly to your Instagram account.", provider: "instagram", status: "DISCONNECTED" },
    { id: "tiktok", name: "TikTok", icon: Video, color: "bg-black", description: "Sync videos directly to your TikTok profile.", provider: "tiktok", status: "DISCONNECTED" },
    { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "bg-sky-500", description: "Post videos directly to your X timeline.", provider: "twitter", status: "DISCONNECTED" },
  ])

  useEffect(() => {
    // Map the database connected platforms to the UI state
    setPlatforms(current => current.map(p => {
      const dbMatch = connectedPlatforms.find(cp => cp.platform.toLowerCase() === p.id)
      if (dbMatch) {
        return { ...p, status: "CONNECTED", userName: dbMatch.accountName || "Connected Account" }
      }
      return { ...p, status: "DISCONNECTED", userName: undefined }
    }))
  }, [connectedPlatforms])

  const [isPending, startTransition] = useTransition()

  const handleConnect = async (provider: string) => {
    // Update local UI state to loading
    setPlatforms(current => current.map(p => p.provider === provider ? { ...p, status: "LOADING" } : p))

    // Initiate OAuth flow
    await signIn(provider, { callbackUrl: "/dashboard" })
  }

  const handleDisconnect = async (platformId: string) => {
    startTransition(async () => {
      await disconnectPlatform(platformId)
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center relative">
              <div className="w-8"></div> {/* Spacer to perfectly center the text visually */}
              <div className="w-full">
                <h2 className="text-xl font-bold text-gray-900 text-center">Connect Platforms</h2>
                <p className="text-sm text-gray-500 mt-0.5">Link your social media accounts to automatically publish videos.</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition absolute right-6">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 mb-6">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Secure Connection</h4>
                  <p className="text-xs mt-1 text-blue-700/80">We request read profile and content publishing permissions. Your access tokens are securely encrypted in our database and never shared.</p>
                </div>
              </div>

              {platforms.map(platform => (
                <div key={platform.id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all bg-white relative overflow-hidden group">
                  <div className={`w-12 h-12 ${platform.color} rounded-xl shadow-inner flex items-center justify-center flex-shrink-0`}>
                    <platform.icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 justify-start">
                      {platform.name}
                      {platform.status === 'CONNECTED' && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Connected</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 pr-4 text-left">{platform.description}</p>
                    {platform.userName && platform.status === 'CONNECTED' && (
                      <p className="text-xs font-medium text-emerald-600 mt-1.5 flex items-center gap-1 justify-start">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated as {platform.userName}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {platform.status === 'LOADING' ? (
                      <button disabled className="w-28 h-9 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center gap-2 cursor-not-allowed">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </button>
                    ) : platform.status === 'CONNECTED' ? (
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={isPending}
                        className="w-28 h-9 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition flex items-center justify-center disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disconnect"}
                      </button>
                    ) : (
                      <button onClick={() => handleConnect(platform.provider)} className="w-28 h-9 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center justify-center shadow-sm hover:shadow-indigo-500/20">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end">
              <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm">
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
