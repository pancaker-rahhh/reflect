// This is the main script for your embeddable widget

// A simple interface to define the shape of the config object
interface ReflectConfig {
  key: string
}

// Extend the Window interface to let TypeScript know about our config object
declare global {
  interface Window {
    reflectConfig: ReflectConfig
  }
}

/**
 * Self-executing function to initialize the widget.
 * This pattern prevents polluting the global scope.
 */
;(function () {
  // --- STATE MANAGEMENT ---
  let isWidgetOpen = false
  let iframe: HTMLIFrameElement | null = null
  let launcherContainer: HTMLDivElement | null = null

  // --- ICONS ---
  const launcherIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8.5"/>
      <path d="M18 13a3 3 0 1 0-3.5-3.5"/>
    </svg>
  `
  const closeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `

  // 1. Check for the configuration object on the window
  if (!window.reflectConfig || !window.reflectConfig.key) {
    console.error(
      'Reflect Widget: Configuration object (window.reflectConfig) not found or public key is missing.'
    )
    return
  }

  const publicKey = window.reflectConfig.key

  // Use environment-based URLs
  const isDevelopment =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const apiBaseUrl = isDevelopment ? 'http://localhost:8000' : 'https://api.reflect.com'
  const appBaseUrl = isDevelopment ? 'http://localhost:5173' : 'https://app.reflect.com'

  const widgetAppUrl = `${appBaseUrl}/widget-view?key=${publicKey}`
  const apiUrl = `${apiBaseUrl}/api/v1/public/widgets/${publicKey}`

  // 2. Fetch the widget configuration from the API
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Widget configuration not found. Status: ${response.status}`)
      }
      return response.json()
    })
    .then((config) => {
      // 3. Render the launcher button
      renderLauncher(config)
    })
    .catch((error) => {
      console.error('Reflect Widget: Failed to load.', error)
    })

  /**
   * Toggles the visibility of the widget iframe.
   */
  function toggleWidget() {
    isWidgetOpen = !isWidgetOpen
    if (isWidgetOpen) {
      if (!iframe) {
        // Create the iframe only on the first click
        iframe = createWidgetIframe()
        document.body.appendChild(iframe)
      }
      // Show the iframe and update the icon
      iframe.style.display = 'block'
      if (launcherContainer) {
        launcherContainer.innerHTML = closeIcon
      }
    } else {
      // Hide the iframe and update the icon
      if (iframe) {
        iframe.style.display = 'none'
      }
      if (launcherContainer) {
        launcherContainer.innerHTML = launcherIcon
      }
    }
  }

  /**
   * Creates the iframe element that will host the main widget application.
   * @returns {HTMLIFrameElement} The created iframe element.
   */
  function createWidgetIframe(): HTMLIFrameElement {
    const iframeEl = document.createElement('iframe')
    iframeEl.id = 'reflect-widget-iframe'
    iframeEl.src = widgetAppUrl // Load your main React app

    // Style the iframe to appear like a modal
    Object.assign(iframeEl.style, {
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '360px',
      height: '500px',
      border: 'none',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      display: 'none', // Initially hidden
      zIndex: '9998',
    })

    return iframeEl
  }

  /**
   * Renders the widget launcher button on the page.
   * @param {any} config The widget configuration from the API.
   */
  function renderLauncher(config: any) {
    launcherContainer = document.createElement('div')
    launcherContainer.id = 'reflect-widget-launcher'
    launcherContainer.onclick = toggleWidget // Add click event listener

    const theme = config.theme_configuration || {}
    const primaryColor = theme.primary || '#6B46C1'

    Object.assign(launcherContainer.style, {
      position: 'fixed',
      zIndex: '9999',
      cursor: 'pointer',
      backgroundColor: primaryColor,
      height: '56px',
      width: '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: 'transform 0.2s ease-in-out',
    })

    launcherContainer.onmouseover = () => {
      if (launcherContainer) launcherContainer.style.transform = 'scale(1.1)'
    }
    launcherContainer.onmouseout = () => {
      if (launcherContainer) launcherContainer.style.transform = 'scale(1)'
    }

    const position = config.position || 'bottom_right'
    if (position.includes('bottom')) launcherContainer.style.bottom = '20px'
    if (position.includes('top')) launcherContainer.style.top = '20px'
    if (position.includes('right')) launcherContainer.style.right = '20px'
    if (position.includes('left')) launcherContainer.style.left = '20px'

    launcherContainer.innerHTML = launcherIcon

    document.body.appendChild(launcherContainer)
  }
})()
