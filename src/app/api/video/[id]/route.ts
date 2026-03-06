import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const video = await prisma.video.findUnique({ where: { id: params.id } })
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const contents = await prisma.platformContent.findMany({ where: { videoId: params.id } })
  return NextResponse.json({ video, contents })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.video.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
