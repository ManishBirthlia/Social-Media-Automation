# Landing Page Components — Setup Notes

## 1. Install framer-motion

framer-motion is not in the ClipFlow starter's package.json. Add it:

```bash
npm install framer-motion
```

## 2. Drop the converted components

Copy all `.tsx` files into your project:

```
src/
└── components/
    └── landing/
        ├── Navbar.tsx
        ├── HeroSection.tsx
        ├── FeaturesSection.tsx
        ├── HowItWorksSection.tsx
        ├── PlatformsSection.tsx
        ├── CTASection.tsx
        └── Footer.tsx
```

## 3. Add the custom CSS classes

Open `src/app/globals.css` and paste the contents of `globals-additions.css`
after the existing `@tailwind` directives.

## 4. Add a hero dashboard image

HeroSection expects an image at:

```
public/hero-dashboard.png
```

Take a screenshot of your ClipFlow dashboard and drop it there.
Any 16:9 image works — Next.js will optimise it automatically.

## 5. Wire up the landing page

Create `src/app/(marketing)/page.tsx`:

```tsx
import Navbar              from "@/components/landing/Navbar"
import HeroSection         from "@/components/landing/HeroSection"
import FeaturesSection     from "@/components/landing/FeaturesSection"
import HowItWorksSection   from "@/components/landing/HowItWorksSection"
import PlatformsSection    from "@/components/landing/PlatformsSection"
import CTASection          from "@/components/landing/CTASection"
import Footer              from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlatformsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
```

## 6. Move the dashboard behind /dashboard

Update `src/app/page.tsx` to redirect logged-in users:

```tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")
  // Not logged in → show landing page
  return null  // or redirect("/") if landing is at a sub-route
}
```
