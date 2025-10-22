import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, List } from 'phosphor-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandWordmark } from '@/components/common/BrandWordmark'

export const Navbar = () => {
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

  const navLinks = [
    { name: 'Features', href: '#features', targetId: 'features' },
    { name: 'Modules', href: '#interactive-modules', targetId: 'interactive-modules' },
    { name: 'Pricing', href: '#pricing', targetId: 'pricing' },
    { name: 'FAQ', href: '#faq', targetId: 'faq' },
  ]

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/98 backdrop-blur-2xl shadow-2xl border-b border-border/30'
          : 'bg-gradient-to-b from-background/90 via-background/60 to-transparent backdrop-blur-xl'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BrandWordmark size={20} />
          </motion.button>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.targetId)}
                className={`text-base font-medium transition-all duration-300 px-4 py-3 rounded-xl ${
                  isScrolled
                    ? 'text-foreground hover:text-primary hover:bg-primary/8'
                    : isDocsPage
                      ? 'text-foreground hover:text-primary hover:bg-primary/8'
                      : 'text-foreground/90 hover:text-foreground hover:bg-foreground/8'
                } relative`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <motion.button
              onClick={handleLogin}
              className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 px-5 py-3 rounded-2xl hover:bg-primary/8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              Log in
            </motion.button>
            <motion.button
              onClick={handleGetStarted}
              className="rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-300 border border-primary/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 15px 40px rgba(220, 38, 38, 0.3)',
                y: -1,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${
                isScrolled ? 'text-foreground' : isDocsPage ? 'text-foreground' : 'text-foreground'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <List size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`lg:hidden overflow-hidden ${
              isScrolled ? 'bg-white/95' : isDocsPage ? 'bg-white/95' : 'bg-black/20'
            } backdrop-blur-lg`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.div
              className="px-6 pt-2 pb-6 space-y-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {navLinks.map((link, index) => (
                <motion.a
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                className="border-t border-border/20 pt-4 flex flex-col space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleLogin}
                  className={`text-base font-semibold transition-colors ${
                    isScrolled
                      ? 'text-muted-foreground hover:text-primary'
                      : isDocsPage
                        ? 'text-muted-foreground hover:text-primary'
                        : 'text-foreground hover:text-primary'
                  }`}
                >
                  Log in
                </button>
                <motion.button
                  onClick={handleGetStarted}
                  className="rounded-2xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 text-center transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
