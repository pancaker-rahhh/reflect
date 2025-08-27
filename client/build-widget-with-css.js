#!/usr/bin/env node
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

console.log('Building widget with inlined CSS...')

// First, build the widget normally
execSync('npm run build:widget-base', { stdio: 'inherit' })

// Read the generated CSS and JS files
const distDir = resolve('dist-widget')
const cssFile = resolve(distDir, 'widget.css')
const jsFile = resolve(distDir, 'widget.js')

try {
  const cssContent = readFileSync(cssFile, 'utf8')
  const jsContent = readFileSync(jsFile, 'utf8')

  // Process CSS to scope it properly to the widget container
  let processedCSS = cssContent
  
  // Scope all CSS selectors to the widget container to prevent conflicts
  // Since the CSS is minified, we need to parse it differently
  processedCSS = processedCSS
    // First handle root CSS variables
    .replace(/:root\s*\{/g, '#reflect-widget-container {')
    // Scope all CSS class selectors (but preserve @rules and pseudo-selectors)
    .replace(/([^@}]*)(\.[a-zA-Z][\w\-\\]*(?:\[[\w\-\\%:]*\])?(?:\\\[[\w\-\\%:]*\\\])*)([\s\{])/g, (match, before, selector, after) => {
      // Skip if already scoped or if it's within an @rule context
      if (before.includes('#reflect-widget-container') || before.includes('@')) {
        return match
      }
      return `${before}#reflect-widget-container ${selector}${after}`
    })
    // Clean up any double scoping
    .replace(/#reflect-widget-container\s+#reflect-widget-container/g, '#reflect-widget-container')
    // Fix any @rules that might have been accidentally scoped
    .replace(/#reflect-widget-container\s+@/g, '@')
    // Fix pseudo-selectors that shouldn't be scoped
    .replace(/#reflect-widget-container\s+(::?[\w\-]+)/g, '$1')

  console.log('✨ CSS scoped to widget container to prevent conflicts')

  // Escape CSS content for JavaScript string
  const escapedCSS = processedCSS
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/`/g, '\\`')    // Escape backticks
    .replace(/\$/g, '\\$')   // Escape dollar signs

  // Create CSS injection code
  const cssInjectionCode = `
// Inject CSS styles scoped to widget container
(function() {
  if (typeof document === 'undefined') return;
  
  const styleId = 'reflect-widget-styles';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.type = 'text/css';
  style.innerHTML = \`${escapedCSS}\`;
  document.head.appendChild(style);
})();

`

  // Combine CSS injection with JS content
  const finalJsContent = cssInjectionCode + jsContent

  // Write the updated JS file
  writeFileSync(jsFile, finalJsContent, 'utf8')

  // Remove the separate CSS file since it's now inlined
  execSync(`rm "${cssFile}"`)

  console.log('✅ Widget built successfully with inlined CSS')
  console.log(`📦 Output: ${jsFile}`)

} catch (error) {
  console.error('❌ Error building widget:', error)
  process.exit(1)
}