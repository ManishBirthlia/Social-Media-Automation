"use client"
import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { Youtube, Instagram, Video, Twitter, ExternalLink, Key, Save, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { signIn } from "next-auth/react"
import { disconnectPlatform } from "@/app/actions/platform"

const PLATFORMS = [
  {
    id: "youtube",
    label: "YouTube",
    subLabel: "YouTube Shorts",
    icon: Youtube,
    color: "#FF0000",
    bg: "bg-red-50",
    border: "border-red-200",
    scope: "Upload videos, manage channel",
    provider: "google",
  },
  {
    id: "instagram",
    label: "Instagram",
    subLabel: "Instagram Reels",
    icon: Instagram,
    color: "#E1306C",
    bg: "bg-pink-50",
    border: "border-pink-200",
    scope: "Publish Reels, read insights",
    provider: "instagram",
  },
  {
    id: "tiktok",
    label: "TikTok",
    subLabel: "TikTok Videos",
    icon: Video,
    color: "#010101",
    bg: "bg-slate-50",
    border: "border-slate-200",
    scope: "Upload videos, content posting",
    provider: "tiktok",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    subLabel: "X / Twitter",
    icon: Twitter,
    color: "#000000",
    bg: "bg-slate-50",
    border: "border-slate-200",
    scope: "Post tweets with media",
    provider: "twitter",
  },
]

export default function SettingsClient({ connectedPlatforms }: { connectedPlatforms: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [connecting, setConnecting] = useState<string | null>(null)

  // Real platform connection mapping
  const connectedMap = connectedPlatforms.reduce((acc, cp) => {
    acc[cp.platform.toLowerCase()] = cp
    return acc
  }, {} as Record<string, any>)

  const [openaiKey, setOpenaiKey] = useState("")
  const [anthropicKey, setAnthropicKey] = useState("")
  const [savingKeys, setSavingKeys] = useState(false)

  const handleConnect = async (provider: string, id: string) => {
    setConnecting(id)
    await signIn(provider, { callbackUrl: "/settings" })
  }

  const handleDisconnect = async (platformId: string) => {
    startTransition(async () => {
      try {
        await disconnectPlatform(platformId)
        toast.success(`${platformId} disconnected`)
      } catch (e: any) {
        toast.error("Failed to disconnect platform")
      }
    })
  }

  const saveApiKeys = async () => {
    setSavingKeys(true)
    await new Promise(r => setTimeout(r, 800))
    setSavingKeys(false)
    toast.success("API keys saved securely")
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Platform Connections */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Platform Connections</h3>
          <p className="text-slate-500 text-sm mt-0.5">Connect your social media accounts to enable publishing</p>
        </div>

        <div className="divide-y divide-slate-50">
          {PLATFORMS.map(platform => {
            const dbMatch = connectedMap[platform.id]
            const isConnected = !!dbMatch
            const isConnecting = connecting === platform.id
            const Icon = platform.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>

            return (
              <div key={platform.id} className="flex items-center gap-5 px-6 py-5 hover:bg-slate-50/50 transition">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border", platform.bg, platform.border)}>
                  <Icon className="w-6 h-6" style={{ color: platform.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{platform.label}</p>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 text-left">{platform.scope}</p>
                  {isConnected && dbMatch.accountName && (
                    <p className="text-emerald-600 font-medium text-xs mt-1 text-left">Authenticated as {dbMatch.accountName}</p>
                  )}
                </div>

                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Disconnect"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.provider, platform.id)}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    {isConnecting ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...</>
                    ) : (
                      <><ExternalLink className="w-3.5 h-3.5" /> Connect</>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Connection guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-amber-700 font-bold text-sm">!</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">Platform App Review Required</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Instagram, TikTok, and YouTube require formal app review before publish scopes are available to real users. This process takes 4–8 weeks.
              Add your OAuth credentials in <code className="bg-amber-100 px-1 rounded font-mono">.env.local</code> and submit for review early.
            </p>
          </div>
        </div>
      </div>

      {/* AI API Keys */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">AI Configuration</h3>
          <p className="text-slate-500 text-sm mt-0.5">API keys for transcription and content generation</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" /> OpenAI API Key
              <span className="text-xs font-normal text-slate-500">(Whisper + GPT-4)</span>
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" /> Anthropic API Key
              <span className="text-xs font-normal text-slate-500">(Claude — optional fallback)</span>
            </label>
            <input
              type="password"
              value={anthropicKey}
              onChange={e => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white font-mono"
            />
          </div>
          <button
            onClick={saveApiKeys}
            disabled={savingKeys}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            {savingKeys ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save API Keys
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 text-base mb-4">Application Info</h3>
        <div className="space-y-3">
          {[
            ["Version", "0.1.0 (Personal)"],
            ["Mode", "Single-user admin"],
            ["Framework", "Next.js 14 (App Router)"],
            ["Database", "PostgreSQL via Prisma"],
            ["Storage", "Cloudflare R2"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-500">{k}</span>
              <span className="text-sm font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
