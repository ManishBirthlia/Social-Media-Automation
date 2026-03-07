"use client"

// CTASection — Client Component (framer-motion + useRef/useInView).

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

const CTASection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="pricing" className="relative py-32">
      <div className="container mx-auto px-6">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary via-card to-secondary p-12 md:p-20 text-center"
        >
          {/* Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/15 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-accent/15 blur-[80px] rounded-full" />

          <div className="relative z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Zap className="h-3 w-3" />
              Ready to automate?
            </div>

            {/* Headline */}
            <h2 className="font-display text-4xl md:text-5xl font-bold max-w-2xl mx-auto leading-tight">
              Stop posting manually.{" "}
              <span className="text-gradient">Start scaling.</span>
            </h2>

            {/* Body */}
            <p className="mt-6 text-muted-foreground max-w-lg mx-auto">
              Set up ClipFlow in minutes, connect your platforms, and let AI handle the busywork.
            </p>

            {/* CTA */}
            <div className="mt-10">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground glow-primary hover:opacity-90 transition"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}

export default CTASection
