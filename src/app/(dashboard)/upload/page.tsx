"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload, Link, FileVideo, X, Loader2, Zap, ChevronDown } from "lucide-react"
import { cn, formatFileSize } from "@/lib/utils"

const NICHES = ["general","technology","fitness","cooking","travel","gaming","finance","education","entertainment","lifestyle","business","health"]
const TONES  = [
  { value: "professional", label: "Professional",  desc: "Polished and authoritative" },
  { value: "casual",       label: "Casual",        desc: "Friendly and conversational" },
  { value: "energetic",    label: "Energetic",     desc: "High energy and exciting" },
  { value: "educational",  label: "Educational",   desc: "Informative and clear" },
  { value: "humorous",     label: "Humorous",      desc: "Fun and entertaining" },
]

export default function UploadPage() {
  const router = useRouter()
  const [tab, setTab]         = useState<"file" | "url">("file")
  const [file, setFile]       = useState<File | null>(null)
  const [ytUrl, setYtUrl]     = useState("")
  const [title, setTitle]     = useState("")
  const [niche, setNiche]     = useState("general")
  const [tone, setTone]       = useState("professional")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage]     = useState("")

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFile(accepted[0]); if (!title) setTitle(accepted[0].name.replace(/\.[^.]+$/, "")) }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"] }, maxFiles: 1, maxSize: 500 * 1024 * 1024,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === "file" && !file) { toast.error("Please select a video file"); return }
    if (tab === "url"  && !ytUrl.trim()) { toast.error("Please enter a YouTube URL"); return }
    if (!title.trim()) { toast.error("Please enter a title"); return }

    setLoading(true)
    setProgress(10)
    setStage("Uploading video...")

    try {
      const formData = new FormData()
      if (tab === "file" && file) formData.append("file", file)
      if (tab === "url")          formData.append("youtubeUrl", ytUrl)
      formData.append("title", title)
      formData.append("niche", niche)
      formData.append("tone", tone)

      setProgress(30)
      setStage("Processing video...")
      const endpoint = tab === "file" ? "/api/video/upload" : "/api/video/ingest-url"
      const uploadRes = await fetch(endpoint, { method: "POST", body: formData })
      if (!uploadRes.ok) { const e = await uploadRes.json(); throw new Error(e.error ?? "Upload failed") }
      const { videoId } = await uploadRes.json()

      setProgress(60)
      setStage("Transcribing audio...")
      await new Promise(r => setTimeout(r, 800))

      setProgress(80)
      setStage("Generating AI content for all platforms...")
      const genRes = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      })
      if (!genRes.ok) { const e = await genRes.json(); throw new Error(e.error ?? "Generation failed") }

      setProgress(100)
      setStage("Done!")
      toast.success("Content generated for all 5 platforms!")
      await new Promise(r => setTimeout(r, 600))
      router.push(`/videos/${videoId}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      toast.error(msg)
      setLoading(false)
      setProgress(0)
      setStage("")
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tab selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {([
            { id: "file", icon: FileVideo, label: "Upload File" },
            { id: "url",  icon: Link,      label: "YouTube URL" },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {tab === "file" ? (
            <div>
              {file ? (
                <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileVideo className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className={cn("w-7 h-7 transition-colors", isDragActive ? "text-indigo-600" : "text-slate-400")} />
                  </div>
                  <p className="text-slate-700 font-semibold text-base mb-1">
                    {isDragActive ? "Drop your video here" : "Drag & drop your video"}
                  </p>
                  <p className="text-slate-500 text-sm mb-4">or click to browse files</p>
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs px-3 py-1.5 rounded-full">
                    MP4, MOV, AVI, WebM — max 500MB
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">YouTube Video URL</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-500" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <input
                  type="url"
                  value={ytUrl}
                  onChange={e => { setYtUrl(e.target.value); if (!title && e.target.value) setTitle("YouTube Video") }}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                />
              </div>
              <p className="text-xs text-slate-500">Paste any public YouTube video URL — we'll download and process it automatically.</p>
            </div>
          )}
        </div>
      </div>

      {/* Video details */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-slate-900">Content Settings</h3>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter a title for your video..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Content Niche</label>
              <div className="relative">
                <select
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white appearance-none pr-9"
                >
                  {NICHES.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Content Tone</label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white appearance-none pr-9"
                >
                  {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tone description */}
          <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <span className="font-semibold text-slate-600">Tone: </span>
            {TONES.find(t => t.value === tone)?.desc}
          </p>

          {/* Progress bar */}
          {loading && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  {stage}
                </span>
                <span className="text-sm font-bold text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (tab === "file" ? !file : !ytUrl.trim()) || !title.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md shadow-indigo-200 text-sm"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <><Zap className="w-4 h-4" /> Generate Content for All Platforms</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
