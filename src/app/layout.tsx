// "use client"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/layout/Providers"

export const metadata: Metadata = {
  title: { default: "ClipFlow", template: "%s | ClipFlow" },
  description: "AI-powered social media automation platform",
  icons: { icon: "/favicon.ico" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-sans)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
