import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { publishToYouTube } from "@/lib/platforms/youtube"
import { publishToInstagram } from "@/lib/platforms/instagram"
import { publishToTikTok } from "@/lib/platforms/tiktok"
import { publishToFacebook } from "@/lib/platforms/facebook"
import { publishToTwitter } from "@/lib/platforms/twitter"
import type { Platform } from "@/types"

// Called by Vercel Cron — protect with secret
export async function GET(req: NextRequest) {
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const dueJobs = await prisma.scheduledJob.findMany({
    where: { status: "PENDING", scheduledAt: { lte: now } },
    take: 10,
    include: { video: { select: { id: true, title: true, storagePath: true } } },
  })

  const results = await Promise.allSettled(dueJobs.map(async job => {
    await prisma.scheduledJob.update({ where: { id: job.id }, data: { status: "PROCESSING" } })

    try {
      let postId: string | undefined

      switch (job.platform as Platform) {
        case "YOUTUBE":   postId = await publishToYouTube(job)   ?? undefined; break
        case "INSTAGRAM": postId = await publishToInstagram(job) ?? undefined; break
        case "TIKTOK":    postId = await publishToTikTok(job)    ?? undefined; break
        case "FACEBOOK":  postId = await publishToFacebook(job)  ?? undefined; break
        case "TWITTER":   postId = await publishToTwitter(job)   ?? undefined; break
      }

      await prisma.scheduledJob.update({
        where: { id: job.id },
        data: { status: "PUBLISHED", executedAt: now, },
      })
      await prisma.publishLog.create({
        data: { videoId: job.videoId, platform: job.platform, status: "PUBLISHED", platformPostId: postId ?? null },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      await prisma.scheduledJob.update({
        where: { id: job.id },
        data: { status: "FAILED", errorMsg: msg, retryCount: { increment: 1 } },
      })
      await prisma.publishLog.create({
        data: { videoId: job.videoId, platform: job.platform, status: "FAILED", errorMsg: msg },
      })
    }
  }))

  const succeeded = results.filter(r => r.status === "fulfilled").length
  const failed    = results.filter(r => r.status === "rejected").length

  return NextResponse.json({ processed: dueJobs.length, succeeded, failed })
}
