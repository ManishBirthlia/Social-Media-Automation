import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  videoId:     z.string(),
  platform:    z.enum(["YOUTUBE", "INSTAGRAM", "TIKTOK", "FACEBOOK", "TWITTER"]),
  scheduledAt: z.string().datetime(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.message }, { status: 400 })

  const { videoId, platform, scheduledAt } = body.data

  const job = await prisma.scheduledJob.create({
    data: { videoId, platform, scheduledAt: new Date(scheduledAt), status: "PENDING" },
  })

  return NextResponse.json({ job })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const jobs = await prisma.scheduledJob.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    orderBy: { scheduledAt: "asc" },
    include: { video: { select: { id: true, title: true, thumbnailPath: true } } },
  })

  return NextResponse.json({ jobs })
}
