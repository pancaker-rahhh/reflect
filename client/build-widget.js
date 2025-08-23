#!/usr/bin/env node

/**
 * Build script for Reflect Widget CDN distribution
 * This script creates a minified, production-ready version of the widget
 */

/* eslint-env node */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple minification function (you can replace with a proper minifier like terser)
function minify(code) {
  return (
    code
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove unnecessary spaces around operators
      .replace(/\s*([{}();,:])\s*/g, '$1')
      .trim()
  )
}

function buildWidget() {
  console.log('🔨 Building Reflect Widget for CDN...')

  const inputPath = path.join(__dirname, 'public', 'widget.js')
  const outputPath = path.join(__dirname, 'dist', 'widget.js')
  const outputDir = path.dirname(outputPath)

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  try {
    // Read the source widget
    const sourceCode = fs.readFileSync(inputPath, 'utf8')

    // Create production version with environment variables replaced
    const productionCode = sourceCode
      .replace(/localhost:8000/g, 'api.reflect.com')
      .replace(/localhost:5173/g, 'app.reflect.com')
      .replace(/127\.0\.0\.1:8000/g, 'api.reflect.com')
      .replace(/127\.0\.0\.1:5173/g, 'app.reflect.com')

    // Minify the code
    const minifiedCode = minify(productionCode)

    // Add header comment
    const header = `/**
 * Reflect Widget v1.0.0
 * CDN Distribution - Production Build
 * Generated: ${new Date().toISOString()}
 */\n`

    const finalCode = header + minifiedCode

    // Write the built widget
    fs.writeFileSync(outputPath, finalCode)

    console.log('✅ Widget built successfully!')
    console.log(`📦 Output: ${outputPath}`)
    console.log(`📏 Size: ${(finalCode.length / 1024).toFixed(2)} KB`)

    // Copy development version as well
    const devOutputPath = path.join(__dirname, 'dist', 'widget-dev.js')
    fs.writeFileSync(devOutputPath, header + sourceCode)
    console.log(`🔧 Development version: ${devOutputPath}`)
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
buildWidget()

export { buildWidget }
