"use client"

// HowItWorksSection — Client Component (framer-motion).
//
// BUG FIXED from original:
//   The original called useRef() and useInView() inside a .map() callback.
//   Hooks must only be called at the top level of a React function component.
//   Calling them inside a loop violates the Rules of Hooks and causes a runtime crash.
//   Fix: extract each step into its own <StepCard> component so each hook
//   call is at the top level of that component — exactly as React requires.

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Upload, Sparkles, Send, type LucideIcon } from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const steps: { icon: LucideIcon; step: string; title: string; description: string }[] = [
  {
    icon: Upload,
    step: "01",
    title: "Upload or Paste",
    description:
      "Drag-and-drop a video file or paste a YouTube URL. Choose your niche and content tone.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI Generates Content",
    description:
      "Whisper transcribes, GPT-4 writes platform-optimized captions, titles, hashtags, and descriptions.",
  },
  {
    icon: Send,
    step: "03",
    title: "Review & Publish",
    description:
      "Edit anything inline, set per-platform schedules, and publish instantly or let the cron handle it.",
  },
]

// ─── StepCard (extracted so hooks aren't called inside a .map()) ──────────────

interface StepCardProps {
  step: (typeof steps)[0]
  index: number
}

const StepCard = ({ step, index }: StepCardProps) => {
  // Each hook call is at the TOP LEVEL of this component — valid ✓
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="text-center relative"
    >
      {/* Icon */}
      <div className="mx-auto mb-6 relative inline-flex">
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse-glow" />
        <div className="relative rounded-2xl bg-secondary p-5 border border-border">
          <step.icon className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Label */}
      <span className="block font-display text-xs font-bold text-primary mb-2">
        {step.step}
      </span>
      <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.description}</p>
    </motion.div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

const HowItWorksSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" className="relative py-32">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="container relative mx-auto px-6">

        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            How It Works
          </span>
          <h2 className="font-display text-4xl font-bold mt-3">
            Three steps to <span className="text-gradient">everywhere</span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (decorative, desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />

          {steps.map((step, i) => (
            <StepCard key={step.step} step={step} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default HowItWorksSection
