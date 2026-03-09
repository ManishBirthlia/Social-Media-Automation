"use client"

import { motion } from "framer-motion"
import { Zap, User, Settings, LogOut, LayoutDashboard, Moon } from "lucide-react"
import Link from "next/link"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { signOut, useSession } from "next-auth/react"

// Navbar uses framer-motion → must be a Client Component
// Using Next.js <Link> for internal anchor links

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Platforms", href: "#platforms" },
  { label: "Pricing", href: "#pricing" },
]

const Navbar = () => {
  const { data: session } = useSession()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center"
    >
      <div className="container mx-auto flex items-center justify-between px-6 w-full">

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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary border border-border transition-colors">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[220px] bg-card border border-border rounded-xl shadow-xl shadow-black/20 p-2 z-50 text-card-foreground animate-slide-up"
                sideOffset={8}
                align="end"
              >
                {/* User Info header */}
                <div className="flex flex-col px-2 py-1.5 mb-1 border-b border-border">
                  <span className="text-sm font-medium">{session?.user?.name || "Admin"}</span>
                  <span className="text-xs text-muted-foreground truncate">{session?.user?.email}</span>
                </div>

                <DropdownMenu.Item className="outline-none">
                  <Link href="/profile" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item className="outline-none">
                  <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item className="outline-none">
                  <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer w-full text-left" onClick={() => document.documentElement.classList.toggle('dark')}>
                    <Moon className="h-4 w-4" />
                    Theme (Toggle)
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-border my-1" />

                <DropdownMenu.Item className="outline-none">
                  <div
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </div>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
        </div>)}

      </div>
    </motion.nav>
  )
}

export default Navbar
