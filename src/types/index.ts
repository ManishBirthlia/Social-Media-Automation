export type Platform = "YOUTUBE" | "INSTAGRAM" | "TIKTOK" | "FACEBOOK" | "TWITTER"
export type VideoStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED"
export type JobStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED" | "CANCELLED"
export type Tone = "professional" | "casual" | "energetic" | "educational" | "humorous"

export interface Video {
  id: string
  title: string
  description?: string | null
  storagePath: string
  thumbnailPath?: string | null
  transcript?: string | null
  duration?: number | null
  sourceUrl?: string | null
  niche: string
  tone: string
  status: VideoStatus
  createdAt: Date
  updatedAt: Date
  platformContents?: PlatformContent[]
  scheduledJobs?: ScheduledJob[]
}

export interface PlatformContent {
  id: string
  videoId: string
  platform: Platform
  title?: string | null
  caption?: string | null
  hashtags: string[]
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledJob {
  id: string
  videoId: string
  platform: Platform
  scheduledAt: Date
  status: JobStatus
  executedAt?: Date | null
  errorMsg?: string | null
  retryCount: number
  createdAt: Date
  video?: Pick<Video, "id" | "title" | "thumbnailPath">
}

export interface PublishLog {
  id: string
  videoId: string
  platform: Platform
  status: JobStatus
  platformPostId?: string | null
  errorMsg?: string | null
  publishedAt: Date
  video?: Pick<Video, "id" | "title" | "thumbnailPath">
}

export interface OAuthToken {
  id: string
  platform: Platform
  accessToken: string
  refreshToken?: string | null
  expiresAt?: Date | null
  scope?: string | null
  accountId?: string | null
  accountName?: string | null
}

export interface GeneratedContent {
  platform: Platform
  title?: string
  caption: string
  hashtags: string[]
  description?: string
}

export const PLATFORM_META: Record<Platform, {
  label: string
  color: string
  bgColor: string
  charLimit: number
  hashtagLimit: number
}> = {
  YOUTUBE:   { label: "YouTube Shorts", color: "#FF0000", bgColor: "#FFF0F0", charLimit: 100, hashtagLimit: 15 },
  INSTAGRAM: { label: "Instagram Reels", color: "#E1306C", bgColor: "#FFF0F5", charLimit: 2200, hashtagLimit: 30 },
  TIKTOK:    { label: "TikTok", color: "#010101", bgColor: "#F5F5F5", charLimit: 2200, hashtagLimit: 10 },
  FACEBOOK:  { label: "Facebook Reels", color: "#1877F2", bgColor: "#F0F4FF", charLimit: 63206, hashtagLimit: 10 },
  TWITTER:   { label: "X (Twitter)", color: "#000000", bgColor: "#F7F7F7", charLimit: 280, hashtagLimit: 3 },
}
