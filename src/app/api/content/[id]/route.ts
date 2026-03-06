import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const updated = await prisma.platformContent.update({
    where: { id: params.id },
    data: {
      title:       body.title       ?? undefined,
      caption:     body.caption     ?? undefined,
      hashtags:    body.hashtags    ?? undefined,
      description: body.description ?? undefined,
    },
  })
  return NextResponse.json(updated)
}
