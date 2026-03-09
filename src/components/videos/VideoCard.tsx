"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Trash2, Calendar, ExternalLink, Link2, MoreVertical, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { formatDate, statusColor } from "@/lib/utils"
import { deleteVideo } from "@/app/actions/video" // Server action

export function VideoCard({ video }: { video: any }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle hover play/pause logic safely
  useEffect(() => {
    if (!videoRef.current) return

    if (isHovered && isPlaying && video.storagePath) {
      videoRef.current.play().catch(e => console.log("Aborted playback autoplay", e))
    } else {
      videoRef.current.pause()
    }
  }, [isHovered, isPlaying, video.storagePath])

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(!isPlaying)
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMuted(!isMuted)
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (video.storagePath) {
      navigator.clipboard.writeText(video.storagePath)
      toast.success("Video URL copied to clipboard")
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000) // Reset after 3s
      return
    }

    setIsDeleting(true)
    try {
      await deleteVideo(video.id)
      toast.success("Video deleted successfully")
    } catch (e: any) {
      toast.error(e.message || "Failed to delete video")
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => { setIsHovered(true); setIsPlaying(true) }}
      onMouseLeave={() => { setIsHovered(false); setIsPlaying(false) }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all group relative flex flex-col"
    >
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-sm font-semibold text-slate-700">Deleting...</p>
        </div>
      )}

      {/* Main Aspect Ratio Container */}
      <div className="aspect-video bg-slate-900 relative overflow-hidden flex-1">

        {/* Default Image Thumbnail (Fades out when playing) */}
        <div className={`absolute inset-0 transition-opacity duration-300 z-10 ${isHovered && isPlaying && video.storagePath ? 'opacity-0' : 'opacity-100'}`}>
          {video.thumbnailPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={video.thumbnailPath} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
              {video.status === 'PROCESSING' || video.status === 'PENDING' ? (
                <RefreshCw className="w-10 h-10 text-slate-300 animate-spin-slow mb-2" />
              ) : (
                <Play className="w-10 h-10 text-slate-300 mb-2" />
              )}
            </div>
          )}
        </div>

        {/* Actual Video Element */}
        {video.storagePath && (
          <video
            ref={videoRef}
            src={video.storagePath}
            muted={true}
            autoPlay={isHovered}
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {/* Overlays that appear on HOVER */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-20 pointer-events-none"
            >
              {/* Fullscreen Click Area */}
              <div
                className="absolute inset-0 cursor-pointer pointer-events-auto"
                onClick={() => setIsFullscreen(true)}
              />

              {/* Top Quick Actions */}
              <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto z-10">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button onClick={e => { e.preventDefault(); e.stopPropagation() }} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition shadow-sm">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="min-w-[160px] bg-white rounded-xl shadow-xl shadow-black/10 border border-slate-200 overflow-hidden text-sm z-50 p-1 animate-slide-up" sideOffset={5} align="end">
                      <DropdownMenu.Item className="outline-none asChild">
                        <Link href={`/videos/${video.id}`} onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer text-left">
                          <ExternalLink className="w-4 h-4 text-slate-400" /> View Details
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="outline-none">
                        <button onClick={handleCopyLink} className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer text-left">
                          <Link2 className="w-4 h-4 text-slate-400" /> Copy video URL
                        </button>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                      <DropdownMenu.Item className="outline-none">
                        <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left">
                          <Trash2 className="w-4 h-4 text-red-400" />
                          {showConfirm ? "Click to confirm!" : "Delete video"}
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>

              {/* Bottom Video Controls */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-auto z-10">
                <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center transition shadow-lg backdrop-blur-md border border-white/10 z-10">
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Badge (Always on top right unless hovered, then top left) */}
        <span className={`absolute z-30 ${isHovered ? 'top-3 left-3' : 'top-3 right-3'} transition-all duration-300 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md font-bold ${video.status === 'READY' ? 'bg-emerald-500/90 text-white border-emerald-400' :
          video.status === 'FAILED' ? 'bg-red-500/90 text-white border-red-400' :
            'bg-slate-800/80 text-white border-slate-600'
          }`}>
          {video.status}
        </span>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12"
            onClick={() => setIsFullscreen(false)}
          >
            <div
              className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {video.storagePath ? (
                <video
                  src={video.storagePath}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">Video not available</div>
              )}

              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition"
              >
                <Trash2 className="w-5 h-5 opacity-0 absolute" /> {/* Placeholder to load icon just in case */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
