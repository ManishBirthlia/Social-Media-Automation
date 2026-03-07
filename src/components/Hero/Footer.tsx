// Footer — no hooks or browser APIs used here, so this can stay a Server Component.
// "use client" is intentionally omitted — Next.js renders it on the server by default,
// which is faster and has zero JS bundle cost.

import { Zap } from "lucide-react"
import Link from "next/link"

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-gradient">ClipFlow</span>
      </Link>

      {/* Copyright */}
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ClipFlow. All rights reserved.
      </p>

    </div>
  </footer>
)

export default Footer
