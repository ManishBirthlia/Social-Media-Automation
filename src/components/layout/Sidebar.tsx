"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, Upload, Film, CalendarClock,
  History, Settings, Zap, LogOut, ChevronRight,
  Youtube, Instagram, Video, Twitter
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upload",    icon: Upload,          label: "Upload Video" },
  { href: "/videos",    icon: Film,            label: "My Videos" },
  { href: "/schedule",  icon: CalendarClock,   label: "Schedule" },
  { href: "/history",   icon: History,         label: "Publish History" },
  { href: "/settings",  icon: Settings,        label: "Settings" },
]

const platforms = [
  { icon: Youtube,   color: "#FF0000", label: "YouTube" },
  { icon: Instagram, color: "#E1306C", label: "Instagram" },
  { icon: Video,     color: "#010101", label: "TikTok" },
  { icon: Twitter,   color: "#1DA1F2", label: "X" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50 flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">ClipFlow</p>
            <p className="text-slate-500 text-xs mt-0.5">AI Social Automation</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", active ? "text-white" : "text-slate-500 group-hover:text-white")} style={{ width: 18, height: 18 }} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}

        {/* Platform status */}
        <div className="pt-6">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Platforms</p>
          <div className="px-3 space-y-2">
            {platforms.map(({ icon: Icon, color, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color, width: 16, height: 16 }} />
                <span className="text-slate-500 text-xs flex-1">{label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            ))}
            <Link href="/settings" className="text-xs text-indigo-400 hover:text-indigo-300 transition mt-1 block">
              Connect platforms →
            </Link>
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {session?.user?.name?.[0] ?? "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">{session?.user?.name ?? "Admin"}</p>
            <p className="text-slate-600 text-xs truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-300 transition text-sm font-medium"
        >
          <LogOut style={{ width: 16, height: 16 }} className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
