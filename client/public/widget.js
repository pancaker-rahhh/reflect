/**
 * Reflect Widget - Standalone CDN Version
 * A modern, embeddable feedback widget
 */
;(function () {
  'use strict'

  // Widget state management
  let isWidgetOpen = false
  let iframe = null
  let launcherContainer = null
  let widgetConfig = null

  // Icons
  const launcherIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8.5"/>
      <path d="M18 13a3 3 0 1 0-3.5-3.5"/>
    </svg>
  `

  const closeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `

  // Check for configuration
  if (!window.reflectConfig || !window.reflectConfig.key) {
    console.error(
      'Reflect Widget: Configuration not found. Please add window.reflectConfig with your widget key.'
    )
    return
  }

  const publicKey = window.reflectConfig.key

  // Use production URLs in production, localhost in development
  const isDevelopment =
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:' // For testing with local HTML files
  const apiBaseUrl = isDevelopment ? 'http://localhost:8000' : 'https://api.reflect.com'
  const appBaseUrl = isDevelopment ? 'http://localhost:5173' : 'https://app.reflect.com'

  const apiUrl = `${apiBaseUrl}/api/v1/public/widgets/${publicKey}`

  // Initialize widget
  init()

  async function init() {
    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Widget not found: ${response.status}`)
      }

      widgetConfig = await response.json()
      renderLauncher()
    } catch (error) {
      console.error('Reflect Widget: Failed to load widget configuration', error)
    }
  }

  function renderLauncher() {
    if (!widgetConfig) return

    // Create launcher container
    launcherContainer = document.createElement('div')
    launcherContainer.id = 'reflect-widget-launcher'
    launcherContainer.setAttribute('role', 'button')
    launcherContainer.setAttribute('aria-label', 'Open feedback widget')
    launcherContainer.onclick = toggleWidget

    // Get theme configuration
    const theme = widgetConfig.theme_configuration || {}
    const primaryColor = theme.primary || '#6B46C1'
    const position = widgetConfig.position || 'bottom_right'

    // Style the launcher
    Object.assign(launcherContainer.style, {
      position: 'fixed',
      zIndex: '2147483647', // Maximum z-index
      cursor: 'pointer',
      backgroundColor: primaryColor,
      height: '56px',
      width: '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      color: '#FFFFFF',
      transform: 'scale(1)',
    })

    // Position the launcher
    if (position.includes('bottom')) launcherContainer.style.bottom = '20px'
    if (position.includes('top')) launcherContainer.style.top = '20px'
    if (position.includes('right')) launcherContainer.style.right = '20px'
    if (position.includes('left')) launcherContainer.style.left = '20px'

    // Add hover effects
    launcherContainer.onmouseenter = () => {
      launcherContainer.style.transform = 'scale(1.1)'
      launcherContainer.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)'
    }

    launcherContainer.onmouseleave = () => {
      launcherContainer.style.transform = 'scale(1)'
      launcherContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
    }

    // Set initial icon
    launcherContainer.innerHTML = launcherIcon

    // Add to page
    document.body.appendChild(launcherContainer)
  }

  function toggleWidget() {
    isWidgetOpen = !isWidgetOpen

    if (isWidgetOpen) {
      openWidget()
    } else {
      closeWidget()
    }
  }

  function openWidget() {
    if (!iframe) {
      iframe = createWidgetIframe()
      document.body.appendChild(iframe)
    }

    // Show widget with animation
    iframe.style.display = 'block'
    requestAnimationFrame(() => {
      iframe.style.opacity = '1'
      iframe.style.transform = 'translateY(0) scale(1)'
    })

    // Update launcher icon
    if (launcherContainer) {
      launcherContainer.innerHTML = closeIcon
      launcherContainer.setAttribute('aria-label', 'Close feedback widget')
    }

    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey)
  }

  function closeWidget() {
    if (iframe) {
      iframe.style.opacity = '0'
      iframe.style.transform = 'translateY(20px) scale(0.95)'

      setTimeout(() => {
        iframe.style.display = 'none'
      }, 200)
    }

    // Update launcher icon
    if (launcherContainer) {
      launcherContainer.innerHTML = launcherIcon
      launcherContainer.setAttribute('aria-label', 'Open feedback widget')
    }

    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey)
  }

  function handleEscapeKey(event) {
    if (event.key === 'Escape' && isWidgetOpen) {
      toggleWidget()
    }
  }

  function createWidgetIframe() {
    const iframeEl = document.createElement('iframe')
    const position = widgetConfig.position || 'bottom_right'

    iframeEl.id = 'reflect-widget-iframe'
    iframeEl.src = `${appBaseUrl}/widget-view?key=${publicKey}`
    iframeEl.setAttribute('title', 'Reflect Feedback Widget')
    iframeEl.setAttribute('loading', 'lazy')

    // Base styles
    Object.assign(iframeEl.style, {
      position: 'fixed',
      width: '380px',
      height: '520px',
      maxHeight: '90vh',
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)',
      display: 'none',
      zIndex: '2147483646',
      opacity: '0',
      transform: 'translateY(20px) scale(0.95)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#FFFFFF',
    })

    // Position the widget
    if (position.includes('bottom')) {
      iframeEl.style.bottom = '90px'
    }
    if (position.includes('top')) {
      iframeEl.style.top = '90px'
    }
    if (position.includes('right')) {
      iframeEl.style.right = '20px'
    }
    if (position.includes('left')) {
      iframeEl.style.left = '20px'
    }
    if (position === 'center') {
      iframeEl.style.top = '50%'
      iframeEl.style.left = '50%'
      iframeEl.style.transform = 'translate(-50%, -50%) translateY(20px) scale(0.95)'
    }

    // Handle responsive design
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const handleMobileView = (e) => {
      if (e.matches) {
        // Mobile styles
        Object.assign(iframeEl.style, {
          width: '100vw',
          height: '100vh',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          borderRadius: '0',
          maxHeight: '100vh',
        })
      } else {
        // Desktop styles
        Object.assign(iframeEl.style, {
          width: '380px',
          height: '520px',
          maxHeight: '90vh',
          borderRadius: '16px',
        })

        // Reapply positioning
        if (position.includes('bottom')) iframeEl.style.bottom = '90px'
        if (position.includes('top')) iframeEl.style.top = '90px'
        if (position.includes('right')) iframeEl.style.right = '20px'
        if (position.includes('left')) iframeEl.style.left = '20px'
      }
    }

    mediaQuery.addListener(handleMobileView)
    handleMobileView(mediaQuery)

    return iframeEl
  }

  // Handle widget messages (for future communication between widget and parent)
  window.addEventListener('message', function (event) {
    if (event.origin !== appBaseUrl) return

    switch (event.data.type) {
      case 'WIDGET_CLOSE':
        if (isWidgetOpen) toggleWidget()
        break
      case 'WIDGET_RESIZE':
        if (iframe && event.data.height) {
          iframe.style.height = Math.min(event.data.height, window.innerHeight * 0.9) + 'px'
        }
        break
    }
  })

  // Expose widget API for advanced users
  window.reflectWidget = {
    open: function () {
      if (!isWidgetOpen) toggleWidget()
    },
    close: function () {
      if (isWidgetOpen) toggleWidget()
    },
    toggle: toggleWidget,
    isOpen: function () {
      return isWidgetOpen
    },
  }
})()
