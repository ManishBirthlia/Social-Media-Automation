import axios from "axios"
import { prisma } from "@/lib/db"
import { getPublicUrl } from "@/lib/storage"
import type { ScheduledJob } from "@/types"

export async function publishToTikTok(job: ScheduledJob & { video: { id: string; title: string; storagePath: string } }) {
  const token = await prisma.oAuthToken.findUnique({ where: { platform: "TIKTOK" } })
  if (!token) throw new Error("TikTok account not connected")

  const content = await prisma.platformContent.findUnique({
    where: { videoId_platform: { videoId: job.videoId, platform: "TIKTOK" } },
  })
  if (!content) throw new Error("No TikTok content generated for this video")

  const videoUrl = getPublicUrl(job.video.storagePath)
  const caption  = `${content.caption ?? ""} ${content.hashtags.map(h => `#${h}`).join(" ")} #ad`

  const res = await axios.post(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      post_info: {
        title:            caption.slice(0, 2200),
        privacy_level:    "PUBLIC_TO_EVERYONE",
        disable_duet:     false,
        disable_comment:  false,
        disable_stitch:   false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
    },
    { headers: { Authorization: `Bearer ${token.accessToken}`, "Content-Type": "application/json" } }
  )
  return res.data.data?.publish_id
}
