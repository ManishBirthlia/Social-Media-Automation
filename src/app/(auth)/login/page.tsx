"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; // Used sonner from package.json instead of hook

// --- Lightweight inline UI components matching user's desired Shadcn UI ---
const Button = ({ className = "", variant = "default", type = "button", children, ...props }: any) => {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  return (
    <button type={type} className={`${base} ${(variants as any)[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = "", type = "text", ...props }: any) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

const Label = ({ className = "", children, htmlFor, ...props }: any) => {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
};

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // Simple fetch attempt for registering if the API exists, otherwise we just try credentials signIn
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }).catch(() => null);

        if (res && !res.ok) {
          throw new Error("Registration failed or not available yet.");
        }

        const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
        if (result?.error) throw new Error(result.error);

        toast.success("Account created successfully", { description: "You are now logged in." });
        router.push(callbackUrl);
        router.refresh();
      } else {
        const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
        if (result?.error) throw new Error("Invalid email or password");

        toast.success("Welcome back");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to authenticate" });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    toast(`Connecting to ${provider}...`);
    try {
      await signIn(provider, { callbackUrl });
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Authentication popup blocked or failed" });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-secondary via-card to-background items-center justify-center p-8"
      >
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-md px-12 text-center pointer-events-none">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Zap className="h-10 w-10 text-primary" />
            <span className="font-display text-4xl font-bold text-gradient">ClipFlow</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Automate your content workflow
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            AI-powered scheduling, cross-platform publishing, and analytics — all in one place. Join thousands of creators scaling their reach.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-foreground">10K+</div>
              <div>Creators</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-foreground">5M+</div>
              <div>Posts scheduled</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-foreground">99.9%</div>
              <div>Uptime</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background relative"
      >
        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-gradient">ClipFlow</span>
          </div>

          <h1 className="font-display text-start text-3xl font-bold text-foreground mb-2">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground text-start mb-8">
            {isSignUp ? "Start your free trial today" : "Sign in to your admin panel"}
          </p>

          {/* Social login buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => handleOAuth("google")}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => handleOAuth("apple")}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2 text-start">
              <Label htmlFor="email">Email</Label>
              <div className="relative text-foreground">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@clipflow.app"
                  className="pl-10"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2 text-start">
              <Label htmlFor="password">Password</Label>
              <div className="relative text-foreground">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2 glow-primary" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <div className="mt-6 pt-6 border-t border-border opacity-70">
            <div className="bg-secondary/40 rounded-xl p-4 space-y-1 text-left inline-block w-full">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Demo Admin Credentials</p>
              <p className="text-xs text-foreground font-mono">admin@clipflow.app / admin123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /><div className="mt-4 font-display text-muted-foreground tracking-widest text-sm uppercase">Loading</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
