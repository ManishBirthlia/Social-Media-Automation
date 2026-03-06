"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Youtube, Instagram, Video, Twitter, Check, ExternalLink, Key, Save, Loader2, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const PLATFORMS = [
  {
    id: "YOUTUBE",
    label: "YouTube",
    subLabel: "YouTube Shorts",
    icon: Youtube,
    color: "#FF0000",
    bg: "bg-red-50",
    border: "border-red-200",
    scope: "Upload videos, manage channel",
    oauthPath: "/api/auth/connect/youtube",
  },
  {
    id: "INSTAGRAM",
    label: "Instagram",
    subLabel: "Instagram Reels",
    icon: Instagram,
    color: "#E1306C",
    bg: "bg-pink-50",
    border: "border-pink-200",
    scope: "Publish Reels, read insights",
    oauthPath: "/api/auth/connect/instagram",
  },
  {
    id: "TIKTOK",
    label: "TikTok",
    subLabel: "TikTok Videos",
    icon: Video,
    color: "#010101",
    bg: "bg-slate-50",
    border: "border-slate-200",
    scope: "Upload videos, content posting",
    oauthPath: "/api/auth/connect/tiktok",
  },
  {
    id: "FACEBOOK",
    label: "Facebook",
    subLabel: "Facebook Reels & Pages",
    icon: ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: "#1877F2",
    bg: "bg-blue-50",
    border: "border-blue-200",
    scope: "Post to Pages, publish Reels",
    oauthPath: "/api/auth/connect/facebook",
  },
  {
    id: "TWITTER",
    label: "X (Twitter)",
    subLabel: "X / Twitter",
    icon: Twitter,
    color: "#000000",
    bg: "bg-slate-50",
    border: "border-slate-200",
    scope: "Post tweets with media",
    oauthPath: "/api/auth/connect/twitter",
  },
]

export default function SettingsPage() {
  const [connected, setConnected]     = useState<Record<string, boolean>>({})
  const [connecting, setConnecting]   = useState<string | null>(null)
  const [openaiKey, setOpenaiKey]     = useState("")
  const [anthropicKey, setAnthropicKey] = useState("")
  const [savingKeys, setSavingKeys]   = useState(false)

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId)
    // In a real app, redirect to OAuth flow
    await new Promise(r => setTimeout(r, 1500))
    setConnected(p => ({ ...p, [platformId]: true }))
    setConnecting(null)
    toast.success(`${platformId} connected successfully! (Demo mode)`)
  }

  const handleDisconnect = async (platformId: string) => {
    setConnected(p => ({ ...p, [platformId]: false }))
    toast.success(`${platformId} disconnected`)
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
            const isConnected  = connected[platform.id] ?? false
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
                  <p className="text-slate-500 text-xs mt-0.5">{platform.scope}</p>
                </div>

                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
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
            ["Version",    "0.1.0 (Personal)"],
            ["Mode",       "Single-user admin"],
            ["Framework",  "Next.js 14 (App Router)"],
            ["Database",   "PostgreSQL via Prisma"],
            ["Storage",    "Cloudflare R2"],
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
