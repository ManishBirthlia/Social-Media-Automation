// src/lib/storage.ts
// Local filesystem storage — replaces Cloudflare R2 / AWS S3.
// Files are saved under:
//   /public/uploads/videos/   ← .mp4, .mov, .avi, .webm, .mkv
//   /public/uploads/audio/    ← .mp3, .wav, .m4a, .ogg
//   /public/uploads/images/   ← .jpg, .jpeg, .png, .gif, .webp
//
// The /public directory is served statically by Next.js, so every saved file
// is immediately accessible at:
//   http://localhost:3000/uploads/videos/filename.mp4
//
// To switch back to cloud storage later, swap out this file only — the
// function signatures (uploadFile, deleteFile, getPublicUrl) stay the same.

import fs   from "fs/promises"
import path from "path"

// ─── Folder structure ─────────────────────────────────────────────────────────

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads")

const FOLDERS = {
  video: path.join(UPLOAD_ROOT, "videos"),
  audio: path.join(UPLOAD_ROOT, "audio"),
  image: path.join(UPLOAD_ROOT, "images"),
} as const

type MediaType = keyof typeof FOLDERS

// Create all upload directories on first use (won't fail if they exist)
async function ensureDirs() {
  await Promise.all(
    Object.values(FOLDERS).map(dir => fs.mkdir(dir, { recursive: true }))
  )
}

// ─── Detect media type from MIME or file extension ───────────────────────────

function detectMediaType(contentType: string): MediaType {
  if (contentType.startsWith("video/")) return "video"
  if (contentType.startsWith("audio/")) return "audio"
  if (contentType.startsWith("image/")) return "image"

  // Fallback: inspect the key's extension
  return "video" // default bucket for unknown types
}

function detectMediaTypeFromKey(key: string): MediaType {
  const ext = path.extname(key).toLowerCase()

  const videoExts = [".mp4", ".mov", ".avi", ".webm", ".mkv", ".m4v"]
  const audioExts = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"]
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]

  if (videoExts.includes(ext)) return "video"
  if (audioExts.includes(ext)) return "audio"
  if (imageExts.includes(ext)) return "image"

  return "video" // default
}

// ─── Resolve the full disk path for a stored key ─────────────────────────────
// Key format:  "videos/abc123.mp4"  →  /public/uploads/videos/abc123.mp4
//              "audio/abc123.mp3"   →  /public/uploads/audio/abc123.mp3
//              "images/abc123.png"  →  /public/uploads/images/abc123.png

function keyToDiskPath(key: string): string {
  // Strip any leading slash so path.join works correctly
  return path.join(UPLOAD_ROOT, key.replace(/^\//, ""))
}

// ─── Public URL for a saved file ─────────────────────────────────────────────
// Next.js serves /public as the root, so /public/uploads/... → /uploads/...

export function getPublicUrl(key: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  // key is already like "videos/abc.mp4" — prepend /uploads/
  return `${appUrl}/uploads/${key.replace(/^\//, "")}`
}

// ─── Upload (write to disk) ───────────────────────────────────────────────────

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await ensureDirs()

  const diskPath = keyToDiskPath(key)

  // Make sure the subdirectory exists (e.g. "videos/" inside UPLOAD_ROOT)
  await fs.mkdir(path.dirname(diskPath), { recursive: true })

  await fs.writeFile(diskPath, body)

  return getPublicUrl(key)
}

// ─── Delete (remove from disk) ───────────────────────────────────────────────

export async function deleteFile(key: string): Promise<void> {
  const diskPath = keyToDiskPath(key)
  try {
    await fs.unlink(diskPath)
  } catch (err: unknown) {
    // Ignore "file not found" — already gone
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err
  }
}

// ─── Read file back (replaces presigned URL for local use) ───────────────────
// Returns the file as a Buffer. Useful for piping into platform upload SDKs.

export async function readFile(key: string): Promise<Buffer> {
  const diskPath = keyToDiskPath(key)
  return fs.readFile(diskPath)
}

// ─── "Presigned URL" stub ─────────────────────────────────────────────────────
// Local files are publicly accessible — just return the public URL.
// Signature matches the original so call sites don't need to change.

export async function getPresignedUrl(
  key: string,
  _expiresIn = 3600   // ignored locally
): Promise<string> {
  return getPublicUrl(key)
}

// ─── Helper: build the storage key from a filename + content type ─────────────
// Keeps the correct subfolder convention: "videos/uuid.mp4"

export function buildKey(filename: string, contentType: string): string {
  const mediaType = detectMediaType(contentType)
  const folder    = { video: "videos", audio: "audio", image: "images" }[mediaType]
  return `${folder}/${filename}`
}