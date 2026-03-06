import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData   = await req.formData()
    const youtubeUrl = (formData.get("youtubeUrl") as string) ?? ""
    const title      = (formData.get("title") as string) ?? "YouTube Video"
    const niche      = (formData.get("niche") as string) ?? "general"
    const tone       = (formData.get("tone")  as string) ?? "professional"

    if (!youtubeUrl) return NextResponse.json({ error: "No URL provided" }, { status: 400 })

    // TODO: Use yt-dlp to download and upload to storage
    // const { key, thumbnailKey } = await downloadYouTubeVideo(youtubeUrl)

    const video = await prisma.video.create({
      data: { title, niche, tone, storagePath: "pending", sourceUrl: youtubeUrl, status: "PROCESSING" },
    })

    return NextResponse.json({ videoId: video.id })
  } catch (err) {
    console.error("Ingest error:", err)
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 })
  }
}
