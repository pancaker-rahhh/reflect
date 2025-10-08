import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  House,
  PuzzlePiece,
  ChatCircle,
  Bug,
  Lightbulb,
  MapPin,
  Gear,
  CaretDown,
  CaretRight,
  Star,
  FileText,
  Users,
} from 'phosphor-react'
import { cn } from '@/lib/utils'
import { OrganizationDropdown } from './OrganizationDropdown'
import { BrandWordmark } from '@/components/common/BrandWordmark'
import { isFeatureEnabled } from '@/lib/featureFlags'
import { useUser } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: House,
  },
  {
    label: 'Widgets',
    href: '/app/widgets',
    icon: PuzzlePiece,
  },
  {
    label: 'Feedback & Roadmap',
    href: '/app/feedback',
    icon: ChatCircle,
    children: [
      { label: 'Responses', href: '/app/feedback/responses', icon: FileText },
      { label: 'Reviews', href: '/app/feedback/reviews', icon: Star },
      { label: 'Bug Reports', href: '/app/feedback/bugs', icon: Bug },
      { label: 'Feature Requests', href: '/app/feedback/features', icon: Lightbulb },
      { label: 'Roadmap', href: '/app/roadmap', icon: MapPin },
    ],
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Gear,
    children: [
      { label: 'Account Settings', href: '/app/settings/account', icon: Users },
      ...(isFeatureEnabled('SHOW_ORG_SETTINGS_IN_SIDEBAR')
        ? [{ label: 'Organization Settings', href: '/app/settings/organization', icon: Users }]
        : []),
      { label: 'Project Settings', href: '/app/settings/project', icon: Gear },
      { label: 'Roadmap Settings', href: '/app/settings/roadmap', icon: MapPin },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Feedback & Roadmap', 'Settings'])
  const [isExpanded, setIsExpanded] = useState(false)
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const user = useUser()
  const userEmail = user?.email ?? null
  const avatarSeed = userEmail ? encodeURIComponent(userEmail) : ''

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
                  <CaretDown className="h-4 w-4" />
                ) : (
                  <CaretRight className="h-4 w-4" />
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
          <BrandWordmark size={24} textClassName="text-primary" showText={false} />
        ) : (
          <div className="flex items-center w-full">
            <BrandWordmark textClassName="text-primary" />
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
          <button
            onClick={() => navigate('/app/settings/account?tab=billing')}
            className="w-full bg-primary/90 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {userEmail && (
        <div className="p-3 border-t border-border">
          {!isExpanded ? (
            <div className="flex justify-center">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt="User avatar"
                className="h-8 w-8 rounded-full"
                title={userEmail}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt="User avatar"
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userEmail}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
