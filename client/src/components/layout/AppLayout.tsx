import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MainContent } from '@/components/common/SkipLink'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <MainContent>
          <div className="h-full overflow-y-auto p-8 lg:p-10">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </MainContent>
      </div>
    </div>
  )
}