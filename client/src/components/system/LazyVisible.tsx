import { useState, useEffect, useRef, type ReactNode } from 'react'

interface LazyVisibleProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
}

/**
 * LazyVisible component that only renders children when they become visible in the viewport.
 * Uses IntersectionObserver to detect when the component enters the viewport.
 *
 * @param children - The content to render when visible
 * @param fallback - Optional fallback content to show while waiting for visibility
 * @param rootMargin - Margin around the root (default: '50px' to start loading slightly before visible)
 * @param threshold - Threshold for intersection (default: 0.1)
 */
export function LazyVisible({
  children,
  fallback = null,
  rootMargin = '50px',
  threshold = 0.1,
}: LazyVisibleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // If IntersectionObserver is not supported, render immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Unobserve once visible to avoid unnecessary checks
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, threshold])

  return (
    <div ref={containerRef} style={{ minHeight: isVisible ? 'auto' : '1px' }}>
      {isVisible ? children : fallback}
    </div>
  )
}
