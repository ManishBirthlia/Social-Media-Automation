"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import Link from "next/link"

// Navbar uses framer-motion → must be a Client Component
// Using Next.js <Link> for internal anchor links

const navLinks = [
  { label: "Features",     href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Platforms",    href: "#platforms" },
  { label: "Pricing",      href: "#pricing" },
]

const Navbar = (session) => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-gradient">ClipFlow</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        {session ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
          >
            Dashboard
          </Link>
        ) : (<div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
          >
            Get Started
          </Link>
        </div>) }

      </div>
    </motion.nav>
  )
}

export default Navbar
