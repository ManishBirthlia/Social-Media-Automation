import { prisma } from "@/lib/db"
import Link from "next/link"
import { Film, Plus } from "lucide-react"
import { VideoCard } from "@/components/videos/VideoCard"

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    include: { platformContents: true, scheduledJobs: { where: { status: "PENDING" } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((v: any) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  )
}
