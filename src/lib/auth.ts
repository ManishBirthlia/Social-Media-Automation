import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import bcrypt from "bcryptjs"

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
    jwt({ token, user }) {
      if (user) { token.id = user.id }
      return token
    },
    session({ session, token }) {
      if (session.user) { (session.user as { id?: string }).id = token.id as string }
      return session
    },
  },
}
