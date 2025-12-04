import VideoLazy from '@/components/common/VideoLazy'

interface VideoPlayerProps {
  src: string
  poster?: string
  ariaLabel?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
}

export default function VideoPlayer({
  src,
  poster,
  ariaLabel,
  autoPlay = false,
  loop = false,
  muted = false,
}: VideoPlayerProps) {
  return (
    <VideoLazy
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="metadata"
      className="w-full h-full object-cover"
      poster={poster}
      title={ariaLabel || 'Video content'}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
      aria-label={ariaLabel}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </VideoLazy>
  )
}
