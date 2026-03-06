import { prisma } from "@/lib/db"
import Link from "next/link"
import { Film, Plus, ExternalLink, Calendar } from "lucide-react"
import { formatDate, statusColor } from "@/lib/utils"

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    include: { platformContents: true, scheduledJobs: { where: { status: "PENDING" } } },
  })

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{videos.length} video{videos.length !== 1 ? "s" : ""} total</p>
        <Link href="/upload" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200">
          <Plus className="w-4 h-4" /> Upload Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
          <Film className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 text-lg mb-2">No videos yet</h3>
          <p className="text-slate-500 text-sm mb-6">Upload your first video to start generating AI-powered social content.</p>
          <Link href="/upload" className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Upload First Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map(v => (
            <Link key={v.id} href={`/videos/${v.id}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group shadow-sm"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-100 overflow-hidden relative">
                {v.thumbnailPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnailPath} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium shadow-sm ${statusColor(v.status)}`}>
                  {v.status.charAt(0) + v.status.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-700 transition">{v.title}</h3>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(v.createdAt)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {v.platformContents.length} platforms
                  </div>
                </div>

                {/* Platform badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {v.platformContents.map(pc => (
                    <span key={pc.platform} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {pc.platform === "YOUTUBE" ? "YT" : pc.platform === "INSTAGRAM" ? "IG" : pc.platform === "TIKTOK" ? "TT" : pc.platform === "FACEBOOK" ? "FB" : "X"}
                    </span>
                  ))}
                  {v.scheduledJobs.length > 0 && (
                    <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {v.scheduledJobs.length} scheduled
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
