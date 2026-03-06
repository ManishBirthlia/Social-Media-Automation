"use client"
import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"

const titles: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard",      description: "Overview of your content pipeline" },
  "/upload":    { title: "Upload Video",   description: "Upload a new video and generate content" },
  "/videos":    { title: "My Videos",      description: "Browse and manage your uploaded videos" },
  "/schedule":  { title: "Schedule",       description: "Manage scheduled posts across platforms" },
  "/history":   { title: "Publish History",description: "Track all published and failed posts" },
  "/settings":  { title: "Settings",       description: "Configure platforms, AI, and account settings" },
}

export function Header() {
  const pathname = usePathname()
  const meta = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1]
    ?? { title: "ClipFlow", description: "" }

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{meta.title}</h1>
        {meta.description && <p className="text-slate-500 text-sm mt-0.5">{meta.description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search videos..."
            className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-56 transition"
          />
        </div>
        <button className="relative w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
        </button>
      </div>
    </header>
  )
}
