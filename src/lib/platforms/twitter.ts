import { TwitterApi } from "twitter-api-v2"
import { prisma } from "@/lib/db"
import { getPublicUrl } from "@/lib/storage"
import type { ScheduledJob } from "@/types"

export async function publishToTwitter(job: ScheduledJob & { video: { id: string; title: string; storagePath: string } }) {
  const token = await prisma.oAuthToken.findUnique({ where: { platform: "TWITTER" } })
  if (!token) throw new Error("Twitter/X account not connected")

  const content = await prisma.platformContent.findUnique({
    where: { videoId_platform: { videoId: job.videoId, platform: "TWITTER" } },
  })
  if (!content) throw new Error("No Twitter content generated for this video")

  const client = new TwitterApi(token.accessToken)
  const videoUrl = getPublicUrl(job.video.storagePath)

  // Fetch video buffer
  const videoBuffer = await fetch(videoUrl).then(r => r.arrayBuffer()).then(b => Buffer.from(b))

  // Upload media (chunked)
  const mediaId = await client.v1.uploadMedia(videoBuffer, { mimeType: "video/mp4" })

  // Post tweet
  const tweetText = `${content.caption ?? ""} ${content.hashtags.slice(0, 3).map(h => `#${h}`).join(" ")}`.slice(0, 280)
  const tweet = await client.v2.tweet({ text: tweetText, media: { media_ids: [mediaId] } })

  return tweet.data.id
}
