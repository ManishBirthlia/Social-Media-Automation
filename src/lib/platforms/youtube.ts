import { google } from "googleapis"
import { prisma } from "@/lib/db"
import { getPublicUrl } from "@/lib/storage"
import type { ScheduledJob } from "@/types"

export async function publishToYouTube(job: ScheduledJob & { video: { id: string; title: string; storagePath: string } }) {
  const token = await prisma.oAuthToken.findUnique({ where: { platform: "YOUTUBE" } })
  if (!token) throw new Error("YouTube account not connected")

  const content = await prisma.platformContent.findUnique({
    where: { videoId_platform: { videoId: job.videoId, platform: "YOUTUBE" } },
  })
  if (!content) throw new Error("No YouTube content generated for this video")

  // Initialize OAuth2 client
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  oauth2.setCredentials({
    access_token:  token.accessToken,
    refresh_token: token.refreshToken ?? undefined,
  })

  const youtube = google.youtube({ version: "v3", auth: oauth2 })
  const videoUrl = getPublicUrl(job.video.storagePath)

  // NOTE: YouTube upload requires a readable stream from the video file
  // In production, fetch the video from storage and pipe it
  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title:       content.title ?? job.video.title,
        description: content.description ?? content.caption ?? "",
        tags:        content.hashtags,
        categoryId:  "22",
      },
      status: {
        privacyStatus:     "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: await fetch(videoUrl).then(r => r.body),
    },
  })

  return response.data.id
}
