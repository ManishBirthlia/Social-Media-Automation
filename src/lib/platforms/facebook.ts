import axios from "axios"
import { prisma } from "@/lib/db"
import { getPublicUrl } from "@/lib/storage"
import type { ScheduledJob } from "@/types"

export async function publishToFacebook(job: ScheduledJob & { video: { id: string; title: string; storagePath: string } }) {
  const token = await prisma.oAuthToken.findUnique({ where: { platform: "FACEBOOK" } })
  if (!token) throw new Error("Facebook account not connected")

  const content = await prisma.platformContent.findUnique({
    where: { videoId_platform: { videoId: job.videoId, platform: "FACEBOOK" } },
  })
  if (!content) throw new Error("No Facebook content generated for this video")

  const videoUrl = getPublicUrl(job.video.storagePath)
  const description = `${content.caption ?? ""}

${content.hashtags.map(h => `#${h}`).join(" ")}`
  const pageId = token.accountId!

  const res = await axios.post(`https://graph.facebook.com/v20.0/${pageId}/videos`, {
    file_url:    videoUrl,
    description,
    published:   true,
    access_token: token.accessToken,
  })
  return res.data.id
}
