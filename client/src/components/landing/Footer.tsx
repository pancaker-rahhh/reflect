import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandWordmark } from '@/components/common/BrandWordmark'
import { founders } from '@/components/landing/data/founders'


export const Footer = () => {
  const navigate = useNavigate()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 text-sm">
          {/* Column 1: Brand */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <BrandWordmark />
            <p className="mt-4 text-muted-foreground text-sm sm:text-base">
              The simplest way to capture user feedback and build better products.
            </p>
            <div className="mt-6 flex items-center space-x-5">
              <a
                href="https://x.com/Reflectfeedback"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on X"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/reflect_feedback/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider text-xs sm:text-sm">
              Product
            </h4>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#platform"
                  onClick={(e) => handleNavClick(e, 'platform')}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Platform
                </a>
              </li>
              <li>
                <a
                  href="#interactive-modules"
                  onClick={(e) => handleNavClick(e, 'interactive-modules')}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Modules
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleNavClick(e, 'pricing')}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider text-xs sm:text-sm">
              Company
            </h4>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Meet the Team
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/docs')}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Docs
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/reflect/roadmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider text-xs sm:text-sm">
              Legal
            </h4>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <li>
                <a
                  href="/terms"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Founders */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <h4 className="font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider text-xs sm:text-sm mb-3 sm:mb-4">
              Founders
            </h4>
            <div className="space-y-3">
              {founders.map((founder) => (
                <a
                  key={founder.twitter}
                  href={`https://x.com/${founder.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-all duration-200"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-border group-hover:ring-primary transition-all duration-200"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name)}&size=40&background=random`
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {founder.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span className="truncate">@{founder.twitter}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 border-t border-[hsl(var(--border))] pt-6 flex justify-center items-center">
          <p className="text-[hsl(var(--muted-foreground))] text-xs sm:text-sm text-center">
            &copy; {new Date().getFullYear()} Reflect Technologies, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
