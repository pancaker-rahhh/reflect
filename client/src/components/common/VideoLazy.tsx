import { useRef, useEffect } from 'react'

interface VideoLazyProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string
  poster?: string
  className?: string
}

export default function VideoLazy({ src, poster, children, ...rest }: VideoLazyProps) {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !src) return

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.src = src
              io.disconnect()
            }
          })
        },
        { rootMargin: '200px' }
      )
      io.observe(el)
      return () => io.disconnect()
    } else {
      el.src = src
    }
  }, [src])

  return (
    <video ref={ref} poster={poster} preload="metadata" playsInline {...(rest as any)}>
      {children}
    </video>
  )
}
