import { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Puzzle,
  MessageSquare,
  Bug,
  Lightbulb,
  Map,
  Settings,
  ChevronDown,
  ChevronRight,
  Star,
  FileText,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrganizationDropdown } from './OrganizationDropdown'
import { isFeatureEnabled } from '@/lib/featureFlags'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Widgets',
    href: '/widgets',
    icon: Puzzle,
  },
  {
    label: 'Feedback & Roadmap',
    href: '/feedback',
    icon: MessageSquare,
    children: [
      { label: 'Responses', href: '/feedback/responses', icon: FileText },
      { label: 'Reviews', href: '/feedback/reviews', icon: Star },
      { label: 'Bug Reports', href: '/feedback/bugs', icon: Bug },
      { label: 'Feature Requests', href: '/feedback/features', icon: Lightbulb },
      { label: 'Roadmap', href: '/roadmap', icon: Map },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { label: 'Account Settings', href: '/settings/account', icon: Users },
      ...(isFeatureEnabled('SHOW_ORG_SETTINGS_IN_SIDEBAR')
        ? [{ label: 'Organization Settings', href: '/settings/organization', icon: Users }]
        : []),
      { label: 'Project Settings', href: '/settings/project', icon: Settings },
      { label: 'Roadmap Settings', href: '/settings/roadmap', icon: Map },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Feedback & Roadmap', 'Settings'])
  const [isExpanded, setIsExpanded] = useState(false)
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const handleMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
    setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, 300) // 300ms delay before collapsing
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isItemExpanded = expandedItems.includes(item.label)
    const active = isActive(item.href)

    return (
      <div key={item.href}>
        <Link
          to={hasChildren ? '#' : item.href}
          onClick={
            hasChildren
              ? (e) => {
                  e.preventDefault()
                  toggleExpanded(item.label)
                }
              : undefined
          }
          className={cn(
            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
            'hover:bg-accent hover:text-accent-foreground',
            active && 'bg-primary/10 text-primary',
            level > 0 && isExpanded && 'pl-10',
            !isExpanded && 'justify-center px-3'
          )}
          title={!isExpanded ? item.label : undefined}
        >
          <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
            <item.icon className="h-4 w-4" />
          </div>
          <div
            className={cn(
              'flex items-center justify-between flex-1 min-w-0 transition-all duration-200',
              !isExpanded && 'opacity-0 w-0 overflow-hidden'
            )}
          >
            <span className="truncate">{item.label}</span>
            {hasChildren && (
              <div className="flex-shrink-0 ml-2">
                {isItemExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </Link>
        {hasChildren && isItemExpanded && isExpanded && item.children && (
          <div className="mt-1 space-y-1 overflow-hidden">
            {item.children.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
        isExpanded ? 'w-64' : 'w-16'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn('p-6 flex items-center', !isExpanded && 'p-4 justify-center')}>
        {!isExpanded ? (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <span className="text-xl font-bold text-primary tracking-tight">Reflect</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 mb-4">
          <OrganizationDropdown />
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => renderNavItem(item))}
      </nav>

      {isExpanded && (
        <div className="p-3 border-t border-border">
          <button className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
            Upgrade Now
          </button>
        </div>
      )}

      <div className="p-3 border-t border-border">
        {!isExpanded ? (
          <div className="flex justify-center">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
              alt="User avatar"
              className="h-8 w-8 rounded-full"
              title="john.doe@example.com"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
              alt="User avatar"
              className="h-8 w-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">john.doe@example.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
