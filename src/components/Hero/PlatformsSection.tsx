"use client"

// PlatformsSection — Client Component (framer-motion).
//
// BUG FIXED from original:
//   Same issue as HowItWorksSection — useRef() and useInView() were called
//   inside a .map() callback, violating the Rules of Hooks.
//   Fix: extract each card into its own <PlatformCard> component.

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const platforms: { name: string; color: string; letter: string }[] = [
  { name: "YouTube Shorts",  color: "hsl(0, 80%, 55%)",    letter: "Y" },
  { name: "Instagram Reels", color: "hsl(330, 80%, 55%)",  letter: "I" },
  { name: "TikTok",          color: "hsl(195, 100%, 50%)", letter: "T" },
  { name: "Facebook",        color: "hsl(220, 70%, 55%)",  letter: "F" },
  { name: "X (Twitter)",     color: "hsl(210, 10%, 70%)",  letter: "X" },
]

// ─── PlatformCard (extracted so hooks aren't called inside a .map()) ──────────

interface PlatformCardProps {
  platform: (typeof platforms)[0]
  index: number
}

const PlatformCard = ({ platform, index }: PlatformCardProps) => {
  // Hook calls at the TOP LEVEL of this component — valid ✓
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
      className="glass rounded-2xl p-8 text-center w-40 hover:border-primary/30 transition-colors"
    >
      {/* Platform icon letter */}
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold font-display"
        style={{
          backgroundColor: `${platform.color}20`,
          color: platform.color,
        }}
      >
        {platform.letter}
      </div>
      <span className="text-sm font-medium">{platform.name}</span>
    </motion.div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

const PlatformsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="platforms" className="relative py-32">
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
            Platforms
          </span>
          <h2 className="font-display text-4xl font-bold mt-3">
            One video, <span className="text-gradient">five destinations</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            AI generates character-limit-respecting, platform-aware content for each.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {platforms.map((platform, i) => (
            <PlatformCard key={platform.name} platform={platform} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default PlatformsSection
