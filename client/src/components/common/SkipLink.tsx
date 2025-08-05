export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
    >
      Skip to main content
    </a>
  )
}

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none flex-1 overflow-hidden">
      {children}
    </main>
  )
}