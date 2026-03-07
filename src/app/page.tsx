import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Navbar from "@/components/Hero/Navbar"
import HeroSection from "@/components/Hero/HeroSection"
import CTASection from "@/components/Hero/CTASection"
import FeaturesSection from "@/components/Hero/FeaturesSection"
import Footer from "@/components/Hero/Footer"
import HowItWorksSection from "@/components/Hero/HowItWorksSection"
import PlatformsSection from "@/components/Hero/PlatformsSection"

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  return (
    <div className="min-h-screen bg-background">  
      <Navbar session={session} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlatformsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
