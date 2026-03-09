"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function disconnectPlatform(platformId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.oAuthToken.deleteMany({
    where: { 
      platform: platformId.toUpperCase() as any
    }
  })

  // Revalidate both views that show connections
  revalidatePath("/dashboard")
  revalidatePath("/settings")
  
  return true
}
