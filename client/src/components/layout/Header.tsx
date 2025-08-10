import { useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserMenu } from '../auth/UserMenu'

const pageTitle: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/widgets': 'Your widgets',
  '/widgets/new': 'Create Widget',
  '/feedback/responses': 'Responses',
  '/feedback/reviews': 'Reviews',
  '/feedback/bugs': 'Bug Reports',
  '/feedback/features': 'Feature Requests',
  '/roadmap': 'Roadmap',
  '/settings/account': 'Account Settings',
  '/settings/project': 'Project Settings',
  '/settings/roadmap': 'Roadmap Settings'
}

export function Header() {
  const location = useLocation()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const title = pageTitle[location.pathname] || 'reflect'

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <UserMenu />
      </div>
    </header>
  )
}