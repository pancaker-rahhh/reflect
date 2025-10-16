import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Building2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

export const OrganizationDropdown: React.FC = () => {
  const { organization: currentOrganization, isLoading: loading } = useAppContext()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md px-3 py-2">
        <div className="text-sm font-medium text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {currentOrganization?.name || 'No Organization'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg">
          <div className="p-2">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Organizations
            </div>

            {currentOrganization && (
              <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-left bg-primary/10 text-primary rounded">
                <Building2 className="w-4 h-4" />
                <span>{currentOrganization.name}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
