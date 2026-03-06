import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generatePlatformContent } from "@/lib/ai"
import type { Platform } from "@/types"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { videoId, platform } = await req.json() as { videoId: string; platform?: Platform }

    const video = await prisma.video.findUnique({ where: { id: videoId } })
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 })

    const transcript = video.transcript ?? video.title

    const generated = await generatePlatformContent(transcript, video.title, video.niche, video.tone)

    const toUpsert = platform ? generated.filter(g => g.platform === platform) : generated

    for (const item of toUpsert) {
      await prisma.platformContent.upsert({
        where: { videoId_platform: { videoId, platform: item.platform } },
        create: {
          videoId, platform: item.platform,
          title:       item.title       ?? null,
          caption:     item.caption,
          hashtags:    item.hashtags,
          description: item.description ?? null,
        },
        update: {
          title:       item.title       ?? null,
          caption:     item.caption,
          hashtags:    item.hashtags,
          description: item.description ?? null,
        },
      })
    }

    await prisma.video.update({ where: { id: videoId }, data: { status: "READY" } })

    const contents = await prisma.platformContent.findMany({ where: { videoId } })
    return NextResponse.json({ contents })
  } catch (err) {
    console.error("Generate error:", err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
