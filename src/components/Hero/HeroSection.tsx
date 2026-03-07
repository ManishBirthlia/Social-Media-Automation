"use client"
import { motion } from "framer-motion"
import { Play, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import heroDashboard from "@/app/assets/hero-dashboard.jpg"

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-[120px] animate-pulse-glow" />

      <div className="container relative z-10 mx-auto px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Play className="h-3 w-3" fill="currentColor" />
            AI-Powered Video Distribution
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight max-w-4xl mx-auto"
        >
          Upload once.{" "}
          <span className="text-gradient">AI writes the content.</span>{" "}
          Publish everywhere.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          ClipFlow takes your video, generates platform-optimized titles, captions &amp; hashtags,
          then publishes to YouTube, Instagram, TikTok, Facebook &amp; X — all on your schedule.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary hover:opacity-90 transition"
          >
            Start Automating
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition"
          >
            See How It Works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="mt-16 relative mx-auto max-w-5xl"
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl" />
          <Image
            src={heroDashboard}
            alt="ClipFlow dashboard showing multi-platform video publishing"
            width={1200}
            height={720}
            priority          // above-the-fold → preload
            className="relative rounded-2xl border border-border/50 shadow-2xl w-full h-auto"
          />
        </motion.div>

      </div>
    </section>
  )
}

export default HeroSection
