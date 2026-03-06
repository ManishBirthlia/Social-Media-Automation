"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, RefreshCw, Send, CalendarClock, Hash, Type, AlignLeft, Loader2, Film, Pencil, Check, X } from "lucide-react"
import { cn, platformColor, formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Platform, PlatformContent, Video } from "@/types"

const PLATFORMS: { id: Platform; label: string; short: string; color: string }[] = [
  { id: "YOUTUBE",   label: "YouTube Shorts",  short: "YT", color: "#FF0000" },
  { id: "INSTAGRAM", label: "Instagram Reels", short: "IG", color: "#E1306C" },
  { id: "TIKTOK",    label: "TikTok",          short: "TT", color: "#010101" },
  { id: "FACEBOOK",  label: "Facebook",        short: "FB", color: "#1877F2" },
  { id: "TWITTER",   label: "X (Twitter)",     short: "X",  color: "#000000" },
]

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [video, setVideo]         = useState<Video | null>(null)
  const [contents, setContents]   = useState<PlatformContent[]>([])
  const [activePlatform, setActive] = useState<Platform>("YOUTUBE")
  const [loading, setLoading]     = useState(true)
  const [regenerating, setRegen]  = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduleTime, setScheduleTime] = useState("")
  const [showScheduleFor, setShowScheduleFor] = useState<Platform | null>(null)

  // Editing state
  const [editing, setEditing]   = useState(false)
  const [editData, setEditData] = useState<Partial<PlatformContent>>({})

  useEffect(() => {
    fetch(`/api/video/${id}`)
      .then(r => r.json())
      .then(d => { setVideo(d.video); setContents(d.contents); setLoading(false) })
      .catch(() => { toast.error("Failed to load video"); setLoading(false) })
  }, [id])

  const current = contents.find(c => c.platform === activePlatform)

  const startEdit = () => {
    if (current) { setEditData({ title: current.title, caption: current.caption, hashtags: current.hashtags, description: current.description }); setEditing(true) }
  }

  const saveEdit = async () => {
    const res = await fetch(`/api/content/${current?.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData),
    })
    if (res.ok) {
      const updated = await res.json()
      setContents(prev => prev.map(c => c.id === updated.id ? updated : c))
      setEditing(false)
      toast.success("Content saved")
    } else toast.error("Failed to save")
  }

  const regenerate = async (platform?: Platform) => {
    setRegen(true)
    const res = await fetch("/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: id, platform }),
    })
    if (res.ok) {
      const { contents: newContents } = await res.json()
      setContents(newContents)
      toast.success(platform ? `${platform} content regenerated` : "All content regenerated")
    } else toast.error("Regeneration failed")
    setRegen(false)
  }

  const publishNow = async (platform: Platform) => {
    setPublishing(true)
    const res = await fetch("/api/publish/now", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: id, platform }),
    })
    if (res.ok) toast.success(`Publishing to ${platform}...`)
    else toast.error("Publish failed")
    setPublishing(false)
  }

  const schedulePost = async (platform: Platform) => {
    if (!scheduleTime) { toast.error("Please select a time"); return }
    setScheduling(true)
    const res = await fetch("/api/schedule", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: id, platform, scheduledAt: new Date(scheduleTime).toISOString() }),
    })
    if (res.ok) { toast.success("Scheduled successfully!"); setShowScheduleFor(null); setScheduleTime("") }
    else toast.error("Scheduling failed")
    setScheduling(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-slate-500 text-sm">Loading video...</p>
      </div>
    </div>
  )

  if (!video) return (
    <div className="text-center py-32">
      <Film className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500">Video not found</p>
      <Link href="/videos" className="text-indigo-600 text-sm mt-2 block hover:underline">Back to videos</Link>
    </div>
  )

  return (
    <div className="max-w-6xl space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()} className="mt-1 p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500 hover:text-slate-700 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">{video.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{video.niche} · {video.tone} · {formatDate(video.createdAt)}</p>
        </div>
        <button
          onClick={() => regenerate()}
          disabled={regenerating}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
          Regenerate All
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Platform Selector */}
        <div className="xl:col-span-1 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Platforms</h3>
          {PLATFORMS.map(p => {
            const c = contents.find(x => x.platform === p.id)
            return (
              <button
                key={p.id}
                onClick={() => { setActive(p.id); setEditing(false) }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all",
                  activePlatform === p.id
                    ? "border-indigo-300 bg-indigo-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold" style={{ color: p.color }}>{p.short}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate", activePlatform === p.id ? "text-indigo-900" : "text-slate-700")}>{p.label}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {c ? `${(c.caption ?? "").slice(0, 35)}...` : "No content yet"}
                  </p>
                </div>
                {c && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Content Editor */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {current ? (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${platformColor(activePlatform)}`}>
                    {PLATFORMS.find(p => p.id === activePlatform)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <button onClick={() => setEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={saveEdit} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={startEdit} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => regenerate(activePlatform)} disabled={regenerating} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <RefreshCw className={cn("w-3.5 h-3.5", regenerating && "animate-spin")} /> Regenerate
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Title */}
                {(current.title !== null || editing) && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Title</span>
                    </div>
                    {editing ? (
                      <input
                        value={editData.title ?? ""}
                        onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    ) : (
                      <p className="text-slate-900 font-semibold text-sm bg-slate-50 rounded-xl px-4 py-3">{current.title ?? "—"}</p>
                    )}
                  </div>
                )}

                {/* Caption */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Caption</span>
                    <span className="text-xs text-slate-400 ml-auto">{(current.caption ?? "").length} chars</span>
                  </div>
                  {editing ? (
                    <textarea
                      value={editData.caption ?? ""}
                      onChange={e => setEditData(p => ({ ...p, caption: e.target.value }))}
                      rows={5}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    />
                  ) : (
                    <p className="text-slate-700 text-sm bg-slate-50 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed">{current.caption ?? "—"}</p>
                  )}
                </div>

                {/* Hashtags */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Hashtags</span>
                    <span className="text-xs text-slate-400 ml-auto">{current.hashtags.length} tags</span>
                  </div>
                  {editing ? (
                    <input
                      value={(editData.hashtags ?? []).join(", ")}
                      onChange={e => setEditData(p => ({ ...p, hashtags: e.target.value.split(",").map(h => h.trim()).filter(Boolean) }))}
                      placeholder="tag1, tag2, tag3"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5 bg-slate-50 rounded-xl px-4 py-3">
                      {current.hashtags.map((h, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-100 font-medium">#{h}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description (YouTube only) */}
                {activePlatform === "YOUTUBE" && current.description && !editing && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</span>
                    <p className="text-slate-700 text-sm bg-slate-50 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{current.description}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {!editing && (
                <div className="px-6 pb-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => publishNow(activePlatform)}
                      disabled={publishing}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition text-sm shadow-sm shadow-indigo-200"
                    >
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Publish Now
                    </button>
                    <button
                      onClick={() => setShowScheduleFor(activePlatform)}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition text-sm"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Schedule
                    </button>
                  </div>

                  {/* Schedule time picker */}
                  {showScheduleFor === activePlatform && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 animate-slide-up">
                      <p className="text-sm font-semibold text-slate-700">Schedule for {PLATFORMS.find(p => p.id === activePlatform)?.label}</p>
                      <input
                        type="datetime-local"
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowScheduleFor(null)}
                          className="bg-white border border-slate-200 text-slate-700 text-sm font-medium py-2 rounded-xl hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => schedulePost(activePlatform)}
                          disabled={scheduling || !scheduleTime}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition flex items-center justify-center gap-2"
                        >
                          {scheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarClock className="w-3.5 h-3.5" />}
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Film className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold mb-1">No content for this platform</p>
              <p className="text-slate-500 text-sm mb-4">Generate content for {PLATFORMS.find(p => p.id === activePlatform)?.label}</p>
              <button onClick={() => regenerate(activePlatform)} disabled={regenerating} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50">
                <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
                Generate Content
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
