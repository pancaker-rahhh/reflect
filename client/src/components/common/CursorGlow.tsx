import { useEffect, useState, useRef } from 'react'

export const CursorGlow = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY })
        setIsVisible(true)
      })
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="absolute w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.25) 0%, rgba(220, 38, 38, 0.15) 25%, rgba(220, 38, 38, 0.05) 50%, transparent 70%)',
          filter: 'blur(40px)',
          transform: `translate(-50%, -50%)`,
        }}
      />
    </div>
  )
}
