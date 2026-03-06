import { prisma } from "@/lib/db"
import { formatDateTime, statusColor, platformColor } from "@/lib/utils"
import { History, CheckCircle2, XCircle, Film, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function HistoryPage() {
  const logs = await prisma.publishLog.findMany({
    orderBy: { publishedAt: "desc" },
    take: 100,
    include: { video: { select: { id: true, title: true, thumbnailPath: true } } },
  })

  const published = logs.filter(l => l.status === "PUBLISHED").length
  const failed    = logs.filter(l => l.status === "FAILED").length

  return (
    <div className="max-w-5xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Total Posts</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Published</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{published}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{failed}</p>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Publish Log</h3>
          <p className="text-slate-500 text-sm mt-0.5">Complete history of all publish attempts</p>
        </div>

        {logs.length === 0 ? (
          <div className="py-20 text-center">
            <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No publish history yet</p>
            <p className="text-slate-400 text-sm mt-1">Publish a video to see activity here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-6 py-3">Video</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Platform</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Published At</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-4 py-3">Post ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {log.video.thumbnailPath
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={log.video.thumbnailPath} alt={log.video.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-slate-400" /></div>
                          }
                        </div>
                        <Link href={`/videos/${log.video.id}`} className="text-sm font-medium text-slate-700 hover:text-indigo-700 max-w-[180px] truncate transition">
                          {log.video.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${platformColor(log.platform)}`}>{log.platform}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {log.status === "PUBLISHED"
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400" />
                        }
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(log.status)}`}>
                          {log.status.charAt(0) + log.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500">{formatDateTime(log.publishedAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      {log.platformPostId ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {log.platformPostId.slice(0, 12)}...
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
