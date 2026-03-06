import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file  = formData.get("file") as File | null
    const title = (formData.get("title") as string) ?? "Untitled"
    const niche = (formData.get("niche") as string) ?? "general"
    const tone  = (formData.get("tone")  as string) ?? "professional"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const ext     = file.name.split(".").pop() ?? "mp4"
    const key     = `videos/${randomUUID()}.${ext}`
    const buffer  = Buffer.from(await file.arrayBuffer())
    const url     = await uploadFile(key, buffer, file.type)

    const video = await prisma.video.create({
      data: { title, niche, tone, storagePath: key, status: "PROCESSING" },
    })

    return NextResponse.json({ videoId: video.id, url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
