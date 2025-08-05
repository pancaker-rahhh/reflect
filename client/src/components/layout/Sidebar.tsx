import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Box,
  MessageSquare,
  Bug,
  Lightbulb,
  Map,
  Settings,
  ChevronDown,
  ChevronRight,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    icon: LayoutDashboard
  },
  {
    label: 'Widgets',
    href: '/widgets',
    icon: Box
  },
  {
    label: 'Feedback & Roadmap',
    href: '/feedback',
    icon: MessageSquare,
    children: [
      { label: 'Responses', href: '/feedback/responses', icon: MessageSquare },
      { label: 'Reviews', href: '/feedback/reviews', icon: Star },
      { label: 'Bug Reports', href: '/feedback/bugs', icon: Bug },
      { label: 'Feature Requests', href: '/feedback/features', icon: Lightbulb },
      { label: 'Roadmap', href: '/roadmap', icon: Map }
    ]
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { label: 'Account Settings', href: '/settings/account', icon: Settings },
      { label: 'Project Settings', href: '/settings/project', icon: Settings },
      { label: 'Roadmap Settings', href: '/settings/roadmap', icon: Settings }
    ]
  }
]

export function Sidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Feedback & Roadmap', 'Settings'])

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.label)
    const active = isActive(item.href)

    return (
      <div key={item.href}>
        <Link
          to={hasChildren ? '#' : item.href}
          onClick={hasChildren ? (e) => {
            e.preventDefault()
            toggleExpanded(item.label)
          } : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            active && 'bg-primary/10 text-primary',
            level > 0 && 'pl-10'
          )}
        >
          <item.icon className="h-4 w-4" />
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Link>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">reflect</h1>
      </div>

      <div className="px-3 mb-4">
        <div className="bg-secondary/50 rounded-md px-3 py-2">
          <select className="w-full bg-transparent text-sm font-medium outline-none">
            <option>webapp</option>
          </select>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navigation.map(item => renderNavItem(item))}
      </nav>

      <div className="p-3 border-t border-border">
        <button className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
          Upgrade Now
        </button>
      </div>

      <div className="p-3 border-t border-border">
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
      </div>
    </div>
  )
}