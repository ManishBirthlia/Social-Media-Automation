import axios from "axios"
import { prisma } from "@/lib/db"
import { getPublicUrl } from "@/lib/storage"
import type { ScheduledJob } from "@/types"

export async function publishToInstagram(job: ScheduledJob & { video: { id: string; title: string; storagePath: string } }) {
  const token = await prisma.oAuthToken.findUnique({ where: { platform: "INSTAGRAM" } })
  if (!token) throw new Error("Instagram account not connected")

  const content = await prisma.platformContent.findUnique({
    where: { videoId_platform: { videoId: job.videoId, platform: "INSTAGRAM" } },
  })
  if (!content) throw new Error("No Instagram content generated for this video")

  const videoUrl = getPublicUrl(job.video.storagePath)
  const caption  = `${content.caption ?? ""}

${content.hashtags.map(h => `#${h}`).join(" ")}`
  const BASE     = "https://graph.facebook.com/v20.0"
  const accountId = token.accountId!

  // Step 1: Create media container
  const containerRes = await axios.post(`${BASE}/${accountId}/media`, {
    media_type:  "REELS",
    video_url:   videoUrl,
    caption,
    access_token: token.accessToken,
  })
  const containerId = containerRes.data.id

  // Step 2: Poll for FINISHED status
  let ready = false
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 6000))
    const statusRes = await axios.get(`${BASE}/${containerId}`, {
      params: { fields: "status_code", access_token: token.accessToken },
    })
    if (statusRes.data.status_code === "FINISHED") { ready = true; break }
    if (statusRes.data.status_code === "ERROR")    throw new Error("Instagram media processing failed")
  }
  if (!ready) throw new Error("Instagram media processing timed out")

  // Step 3: Publish
  const publishRes = await axios.post(`${BASE}/${accountId}/media_publish`, {
    creation_id: containerId,
    access_token: token.accessToken,
  })
  return publishRes.data.id
}
