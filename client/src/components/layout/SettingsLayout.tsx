import { NavLink, Outlet } from 'react-router-dom'
import { User, Bell, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const accountSettingsNavigation = [
  {
    name: 'Account',
    href: '/app/settings/account',
    icon: User,
    description: 'Personal information',
  },
  {
    name: 'Notifications',
    href: '/app/settings/notifications',
    icon: Bell,
    description: 'Email preferences',
  },
  {
    name: 'Billing',
    href: '/app/settings/billing',
    icon: CreditCard,
    description: 'Subscription & billing',
  },
]

export function AccountSettingsLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 space-y-2">
          <nav className="flex flex-row lg:flex-col gap-1 lg:space-y-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {accountSettingsNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink lg:w-full',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <div className="hidden sm:block lg:block">
                  <div>{item.name}</div>
                  <div className="text-xs opacity-75 hidden lg:block">{item.description}</div>
                </div>
                <div className="sm:hidden lg:hidden text-xs">{item.name}</div>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
