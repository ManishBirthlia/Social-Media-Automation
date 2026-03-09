"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function deleteVideo(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    // Note: Since this cascade deletes, PlatformContent, ScheduledJobs, and PublishLogs 
    // connected to this video will also be removed automatically by Prisma.
    await prisma.video.delete({
      where: { id: videoId },
    })
    
    revalidatePath("/dashboard")
    revalidatePath("/videos")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete video:", error)
    throw new Error("Failed to delete video")
  }
}
