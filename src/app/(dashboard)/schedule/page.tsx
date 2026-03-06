import { prisma } from "@/lib/db"
import { formatDateTime, statusColor, platformColor } from "@/lib/utils"
import { CalendarClock, Film, Trash2, Clock } from "lucide-react"
import Link from "next/link"

export default async function SchedulePage() {
  const jobs = await prisma.scheduledJob.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    orderBy: { scheduledAt: "asc" },
    include: { video: { select: { id: true, title: true, thumbnailPath: true } } },
  })

  const now = new Date()
  const upcoming = jobs.filter(j => new Date(j.scheduledAt) > now)
  const overdue  = jobs.filter(j => new Date(j.scheduledAt) <= now)

  return (
    <div className="max-w-5xl space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Scheduled", value: jobs.length,    color: "indigo" },
          { label: "Upcoming",        value: upcoming.length, color: "blue" },
          { label: "Processing",      value: overdue.length,  color: "amber" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-slate-500 text-sm">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Scheduled Jobs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Scheduled Posts</h3>
          <p className="text-slate-500 text-sm mt-0.5">Posts queued for automatic publishing</p>
        </div>

        {jobs.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarClock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No posts scheduled</p>
            <p className="text-slate-400 text-sm mt-1">Go to a video and click &quot;Schedule&quot; to schedule posts.</p>
            <Link href="/videos" className="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline">Browse Videos →</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {jobs.map(job => (
              <div key={job.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  {job.video.thumbnailPath
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={job.video.thumbnailPath} alt={job.video.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-slate-400" /></div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/videos/${job.video.id}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-700 truncate block transition">
                    {job.video.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${platformColor(job.platform)}`}>{job.platform}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(job.scheduledAt)}
                    </div>
                    {new Date(job.scheduledAt) <= now && (
                      <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Processing</span>
                    )}
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(job.status)}`}>
                    {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                  </span>
                  <form action={`/api/schedule/${job.id}/cancel`} method="POST">
                    <button type="submit" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
