import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import InstagramProvider from "next-auth/providers/instagram"
import TwitterProvider from "next-auth/providers/twitter"
// Note: TikTok doesn't have an official built-in provider in older next-auth versions, 
// but we'll use a standard OAuth config block for it when ready.
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/youtube.upload",
        },
      },
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "instagram_business_basic, instagram_business_content_publish",
        }
      }
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0", // Twitter OAuth 2.0
      authorization: {
        params: {
          scope: "users.read tweet.read tweet.write offline.access",
        }
      }
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const adminEmail = process.env.ADMIN_EMAIL ?? "admin@clipflow.app"
        const adminPass = process.env.ADMIN_PASSWORD ?? "admin123"
        const adminName = process.env.ADMIN_NAME ?? "Admin"

        if (credentials.email !== adminEmail) return null

        // Support both plain-text (dev) and hashed passwords
        const isValid =
          credentials.password === adminPass ||
          (adminPass.startsWith("$2") && (await bcrypt.compare(credentials.password, adminPass)))

        if (!isValid) return null

        return { id: "1", email: adminEmail, name: adminName }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // TODO: In a production environment, implement actual AES encryption here
          // using a secure server-side key before saving to the database.
          // Example: const encryptedToken = encrypt(account.access_token)
          const encryptedToken = account.access_token! // Placeholder for encrypted token

          await prisma.oAuthToken.upsert({
            where: { platform: "YOUTUBE" },
            update: {
              accessToken: encryptedToken,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              scope: account.scope,
              accountId: user.id,
              accountName: user.name,
            },
            create: {
              platform: "YOUTUBE",
              accessToken: encryptedToken,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              scope: account.scope,
              accountId: user.id,
              accountName: user.name,
            },
          })
          return true
        } catch (error) {
          console.error("Error saving Google OAuth token:", error)
          return true // still let them log in even if token save fails
        }
      }

      // Handle Instagram
      if (account?.provider === "instagram") {
        try {
          await prisma.oAuthToken.upsert({
            where: { platform: "INSTAGRAM" },
            update: {
              accessToken: account.access_token!,
              accountId: user.id,
              accountName: user.name,
            },
            create: {
              platform: "INSTAGRAM",
              accessToken: account.access_token!,
              accountId: user.id,
              accountName: user.name,
            },
          })
          return true
        } catch(e) { console.error(e) }
      }

      // Handle Twitter (X)
      if (account?.provider === "twitter") {
        try {
          await prisma.oAuthToken.upsert({
            where: { platform: "TWITTER" },
            update: {
              accessToken: account.access_token!,
              refreshToken: account.refresh_token,
              accountId: user.id,
              accountName: user.name,
            },
            create: {
              platform: "TWITTER",
              accessToken: account.access_token!,
              refreshToken: account.refresh_token,
              accountId: user.id,
              accountName: user.name,
            },
          })
          return true
        } catch(e) { console.error(e) }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // user.image comes back from Google Auth natively
        if (user.image) token.picture = user.image
        if (user.name) token.name = user.name
      }
      if (account) {
        token.provider = account.provider
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).provider = token.provider
        // Ensure image and name are propagated to session
        if (token.picture) session.user.image = token.picture as string
        if (token.name) session.user.name = token.name as string
      }
      return session
    },
  },
}
