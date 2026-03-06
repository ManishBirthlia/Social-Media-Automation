import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy")
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function platformColor(platform: string): string {
  const colors: Record<string, string> = {
    YOUTUBE: "text-red-600 bg-red-50",
    INSTAGRAM: "text-pink-600 bg-pink-50",
    TIKTOK: "text-slate-800 bg-slate-100",
    FACEBOOK: "text-blue-600 bg-blue-50",
    TWITTER: "text-sky-600 bg-sky-50",
  }
  return colors[platform] ?? "text-slate-600 bg-slate-100"
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    PUBLISHED: "text-emerald-700 bg-emerald-50 border-emerald-200",
    SCHEDULED: "text-blue-700 bg-blue-50 border-blue-200",
    PENDING:   "text-amber-700 bg-amber-50 border-amber-200",
    PROCESSING:"text-indigo-700 bg-indigo-50 border-indigo-200",
    FAILED:    "text-red-700 bg-red-50 border-red-200",
    CANCELLED: "text-slate-600 bg-slate-100 border-slate-200",
    READY:     "text-emerald-700 bg-emerald-50 border-emerald-200",
  }
  return colors[status] ?? "text-slate-600 bg-slate-100 border-slate-200"
}
