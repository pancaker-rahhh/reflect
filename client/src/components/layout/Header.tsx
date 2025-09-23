import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { UserMenu } from '../auth/UserMenu'
import { ProjectDropdown } from './ProjectDropdown'

const pageTitle: Record<string, string> = {
  '/app/dashboard': 'Dashboard Overview',
  '/app/widgets': 'Your widgets',
  '/app/widgets/new': 'Create Widget',
  '/app/feedback/responses': 'Responses',
  '/app/feedback/reviews': 'Reviews',
  '/app/feedback/bugs': 'Bug Reports',
  '/app/feedback/features': 'Feature Requests',
  '/app/roadmap': 'Roadmap',
  '/app/settings/account': 'Account Settings',
  '/app/settings/project': 'Project Settings',
  '/app/settings/roadmap': 'Roadmap Settings',
}

export function Header() {
  const location = useLocation()
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('dark')
  }, [])

  const title = pageTitle[location.pathname] || 'reflect'

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <ProjectDropdown />
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <UserMenu />
      </div>
    </header>
  )
}
