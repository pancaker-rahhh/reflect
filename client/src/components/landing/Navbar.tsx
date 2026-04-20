import { useState, useEffect, memo, lazy, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BrandWordmark } from '@/components/common/BrandWordmark'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const MAINTENANCE_MSG = 'Server is under maintenance until Tuesday, Apr 22 at 8 PM'

// Lazy load icons only when mobile menu is opened
const MobileMenuIcons = lazy(() =>
  import('phosphor-react').then((mod) => ({
    default: ({ isOpen }: { isOpen: boolean }) => {
      const Icon = isOpen ? mod.X : mod.List
      return <Icon size={24} className="transition-transform duration-200" />
    },
  }))
)

export const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isDocsPage = location.pathname.startsWith('/docs')
  const isStaticPage = ['/about', '/contact', '/terms', '/privacy', '/cookies'].includes(
    location.pathname
  )

  useEffect(() => {
    if (isDocsPage || isStaticPage) {
      setIsScrolled(true)
      return
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDocsPage, isStaticPage])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/#' + targetId)
    } else {
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsMenuOpen(false)
  }

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate('/login')
  }

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate('/login')
  }

  const handleDocs = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = 'https://docs.reflectfeedback.com'
  }

  const navLinks = [
    { name: 'Features', href: '#features', targetId: 'features' },
    { name: 'Modules', href: '#interactive-modules', targetId: 'interactive-modules' },
    { name: 'Pricing', href: '#pricing', targetId: 'pricing' },
    { name: 'FAQ', href: '#faq', targetId: 'faq' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 animate-fade-in ${
        isScrolled
          ? 'bg-background/98 backdrop-blur-2xl shadow-2xl border-b border-border/30'
          : 'bg-gradient-to-b from-background/90 via-background/60 to-transparent backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <BrandWordmark size={20} />
          </button>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.targetId)}
                className={`text-base font-medium transition-all duration-300 px-4 py-3 rounded-xl hover:scale-110 active:scale-95 ${
                  isScrolled
                    ? 'text-foreground hover:text-primary hover:bg-primary/8'
                    : isDocsPage
                      ? 'text-foreground hover:text-primary hover:bg-primary/8'
                      : 'text-foreground/90 hover:text-foreground hover:bg-foreground/8'
                } relative group`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <button
              onClick={handleDocs}
              className={`text-base font-medium transition-all duration-300 px-4 py-3 rounded-xl relative hover:scale-110 active:scale-95 ${
                isScrolled
                  ? 'text-foreground hover:text-primary hover:bg-primary/8'
                  : isDocsPage
                    ? 'text-foreground hover:text-primary hover:bg-primary/8'
                    : 'text-foreground/90 hover:text-foreground hover:bg-foreground/8'
              } group`}
            >
              Docs
              <span className="absolute -bottom-1 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300" />
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-not-allowed">
                  <button
                    disabled
                    aria-disabled="true"
                    className="text-base font-medium text-muted-foreground transition-all duration-300 px-5 py-3 rounded-2xl opacity-50 pointer-events-none"
                  >
                    Log in
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
                {MAINTENANCE_MSG}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-not-allowed">
                  <button
                    disabled
                    aria-disabled="true"
                    className="rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-xl opacity-50 pointer-events-none transition-all duration-300 border border-primary/20"
                  >
                    Get Started
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
                {MAINTENANCE_MSG}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground transition-transform hover:scale-110 active:scale-90"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <Suspense fallback={<span className="w-6 h-6 block" />}>
                <MobileMenuIcons isOpen={isMenuOpen} />
              </Suspense>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isScrolled ? 'bg-white/95' : isDocsPage ? 'bg-white/95' : 'bg-black/20'
          } backdrop-blur-lg animate-slide-down`}
        >
          <div className="px-6 pt-2 pb-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.targetId)}
                className={`block text-base font-semibold transition-colors ${
                  isScrolled
                    ? 'text-muted-foreground hover:text-primary'
                    : isDocsPage
                      ? 'text-muted-foreground hover:text-primary'
                      : 'text-foreground hover:text-primary'
                }`}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={handleDocs}
              className={`block text-base font-semibold transition-colors ${
                isScrolled
                  ? 'text-muted-foreground hover:text-primary'
                  : isDocsPage
                    ? 'text-muted-foreground hover:text-primary'
                    : 'text-foreground hover:text-primary'
              }`}
            >
              Docs
            </button>
            <div className="border-t border-border/20 pt-4 flex flex-col space-y-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="cursor-not-allowed">
                    <button
                      disabled
                      aria-disabled="true"
                      className="text-base font-semibold text-muted-foreground opacity-50 pointer-events-none"
                    >
                      Log in
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
                  {MAINTENANCE_MSG}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="cursor-not-allowed">
                    <button
                      disabled
                      aria-disabled="true"
                      className="rounded-2xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground shadow-sm opacity-50 pointer-events-none text-center"
                    >
                      Get Started
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
                  {MAINTENANCE_MSG}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </header>
  )
})
