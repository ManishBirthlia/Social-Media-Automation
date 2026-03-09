import { prisma } from "@/lib/db"
import { Film, Send, CalendarClock, Link2, TrendingUp, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { formatRelative, statusColor, platformColor } from "@/lib/utils"
import Link from "next/link"
import { ConnectPlatformsButton } from "@/components/dashboard/ConnectPlatformsButton"

async function getDashboardData() {
  const [totalVideos, publishedCount, scheduledCount, recentVideos, recentLogs, connectedPlatforms] = await Promise.all([
    prisma.video.count(),
    prisma.publishLog.count({ where: { status: "PUBLISHED" } }),
    prisma.scheduledJob.count({ where: { status: "PENDING" } }),
    prisma.video.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { platformContents: true } }),
    prisma.publishLog.findMany({ take: 8, orderBy: { publishedAt: "desc" }, include: { video: { select: { title: true } } } }),
    prisma.oAuthToken.findMany({ select: { platform: true, accountName: true } }),
  ])
  const connectedPlatformsCount = connectedPlatforms.length
  return { totalVideos, publishedCount, scheduledCount, recentVideos, recentLogs, connectedPlatforms, connectedPlatformsCount }
}

const statCards = [
  { key: "totalVideos", label: "Total Videos", icon: Film, color: "indigo" },
  { key: "publishedCount", label: "Posts Published", icon: Send, color: "emerald" },
  { key: "scheduledCount", label: "Scheduled", icon: CalendarClock, color: "blue" },
  { key: "connectedPlatforms", label: "Platforms Connected", icon: Link2, color: "violet" },
] as const

const colorMap = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "bg-indigo-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "bg-emerald-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "bg-blue-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "bg-violet-600" },
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 right-32 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <h2 className="text-2xl font-bold mb-1">Welcome back 👋</h2>
          <p className="text-indigo-200 text-sm mb-4">Your AI social media pipeline is ready. Upload a video to get started.</p>
          <div className="flex items-center gap-3">
            <Link href="/upload" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition shadow-sm">
              <Plus className="w-4 h-4" />
              Upload New Video
            </Link>
            <ConnectPlatformsButton connectedPlatforms={data.connectedPlatforms} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }) => {
          const c = colorMap[color]
          return (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">{label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{key === "connectedPlatforms" ? data.connectedPlatformsCount : (data as any)[key]}</p>
                </div>
                <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-slate-500">Up to date</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Videos */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Recent Videos</h3>
            <Link href="/videos" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {data.recentVideos.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Film className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No videos yet</p>
                <Link href="/upload" className="text-indigo-600 text-sm font-medium hover:underline mt-1 block">Upload your first video</Link>
              </div>
            ) : data.recentVideos.map(v => (
              <Link key={v.id} href={`/videos/${v.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition group">
                <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  {v.thumbnailPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnailPath} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition">{v.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{v.platformContents.length} platforms generated</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(v.status)}`}>
                  {v.status.toLowerCase()}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Activity</h3>
            <Link href="/history" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition">View all →</Link>
          </div>
          <div className="px-4 py-4 space-y-1">
            {data.recentLogs.length === 0 ? (
              <div className="py-10 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No activity yet</p>
              </div>
            ) : data.recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                <div className="mt-0.5 flex-shrink-0">
                  {log.status === "PUBLISHED"
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <AlertCircle className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{log.video.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformColor(log.platform)}`}>
                      {log.platform}
                    </span>
                    <span className="text-xs text-slate-400">{formatRelative(log.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
