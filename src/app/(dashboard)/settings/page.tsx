import { prisma } from "@/lib/db"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage() {
  const connectedPlatforms = await prisma.oAuthToken.findMany({
    select: { platform: true, accountName: true },
  })

  return <SettingsClient connectedPlatforms={connectedPlatforms} />
}
