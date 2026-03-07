"use client"

// FeaturesSection uses framer-motion hooks → Client Component.
// FeatureCard is extracted as a named component (same file is fine).
// All hooks are called at the top level of their own component — no map() violation here.

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Video,
  Brain,
  PenLine,
  CalendarClock,
  BarChart3,
  Shield,
  type LucideIcon,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Video,
    title: "Single Upload, 5 Platforms",
    description:
      "Upload a video or paste a YouTube link. ClipFlow handles the rest across every major platform.",
  },
  {
    icon: Brain,
    title: "AI Transcription & Generation",
    description:
      "Whisper transcribes audio, GPT-4 crafts platform-specific captions, hashtags, and descriptions.",
  },
  {
    icon: PenLine,
    title: "Inline Content Editor",
    description:
      "Review and tweak AI-generated content per platform before publishing. Full creative control.",
  },
  {
    icon: CalendarClock,
    title: "Per-Platform Scheduling",
    description:
      "Set independent publish times for each platform. YouTube now, TikTok tomorrow, Instagram Friday.",
  },
  {
    icon: BarChart3,
    title: "Publish History & Logs",
    description:
      "Full audit trail of every post attempt with status, platform, timestamps, and post IDs.",
  },
  {
    icon: Shield,
    title: "Secure Admin Auth",
    description:
      "Credential-based login with JWT sessions and protected routes. Your content stays private.",
  },
]

// ─── FeatureCard (extracted so hooks aren't called inside a .map()) ───────────

interface FeatureCardProps {
  feature: (typeof features)[0]
  index: number
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group glass rounded-2xl p-6 hover:border-primary/30 transition-colors"
    >
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
        <feature.icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

const FeaturesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="relative py-32">
      <div className="container mx-auto px-6">

        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Features
          </span>
          <h2 className="font-display text-4xl font-bold mt-3">
            Everything you need to{" "}
            <span className="text-gradient">automate distribution</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From AI content generation to scheduled publishing — ClipFlow handles the entire
            workflow.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default FeaturesSection
