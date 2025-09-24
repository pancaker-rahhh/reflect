import { useEffect } from 'react'
import { UserMenu } from '../auth/UserMenu'
import { ProjectDropdown } from './ProjectDropdown'

export function Header() {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('dark')
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <ProjectDropdown />
      </div>

      <div className="flex items-center gap-2">
        <UserMenu />
      </div>
    </header>
  )
}
