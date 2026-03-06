import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { publishToYouTube } from "@/lib/platforms/youtube"
import { publishToInstagram } from "@/lib/platforms/instagram"
import { publishToTikTok } from "@/lib/platforms/tiktok"
import { publishToFacebook } from "@/lib/platforms/facebook"
import { publishToTwitter } from "@/lib/platforms/twitter"
import type { Platform } from "@/types"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { videoId, platform } = await req.json() as { videoId: string; platform: Platform }

  const video = await prisma.video.findUnique({ where: { id: videoId } })
  if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 })

  try {
    const jobData = { ...{ id: "now", videoId, platform, scheduledAt: new Date(), status: "PROCESSING" as const, retryCount: 0, executedAt: null, errorMsg: null, createdAt: new Date(), updatedAt: new Date() }, video: { id: video.id, title: video.title, storagePath: video.storagePath } }

    let postId: string | undefined

    switch (platform) {
      case "YOUTUBE":   postId = await publishToYouTube(jobData)   ?? undefined; break
      case "INSTAGRAM": postId = await publishToInstagram(jobData) ?? undefined; break
      case "TIKTOK":    postId = await publishToTikTok(jobData)    ?? undefined; break
      case "FACEBOOK":  postId = await publishToFacebook(jobData)  ?? undefined; break
      case "TWITTER":   postId = await publishToTwitter(jobData)   ?? undefined; break
    }

    await prisma.publishLog.create({
      data: { videoId, platform, status: "PUBLISHED", platformPostId: postId ?? null },
    })

    return NextResponse.json({ ok: true, postId })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Publish failed"
    await prisma.publishLog.create({
      data: { videoId, platform, status: "FAILED", errorMsg: msg },
    })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
