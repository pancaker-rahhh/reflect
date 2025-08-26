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

  // Escape CSS content for JavaScript string
  const escapedCSS = cssContent
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/`/g, '\\`')    // Escape backticks
    .replace(/\$/g, '\\$')   // Escape dollar signs

  // Create CSS injection code
  const cssInjectionCode = `
// Inject CSS styles into the page
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