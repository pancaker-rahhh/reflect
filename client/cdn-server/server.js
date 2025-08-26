const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Enable compression for better performance
app.use(compression());

// Enable CORS for all origins (development setup)
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Cache headers for better performance
app.use('/cdn', (req, res, next) => {
  // Cache static assets for 1 hour in development, 1 day in production
  const maxAge = process.env.NODE_ENV === 'production' ? 86400 : 3600;
  res.set({
    'Cache-Control': `public, max-age=${maxAge}`,
    'ETag': `"${Date.now()}"`, // Simple ETag based on timestamp
    'Vary': 'Accept-Encoding'
  });
  next();
});

// Static serving removed - only serve from deployed-widgets directory

// Serve versioned widgets
app.get('/cdn/widgets/:widgetId/v:version/widget.js', async (req, res) => {
  try {
    const { widgetId, version } = req.params;
    
    // First try to serve from deployed-widgets directory
    const deployedWidgetPath = path.join(__dirname, 'deployed-widgets', widgetId, `v${version}`, 'widget.js');
    
    try {
      await fs.access(deployedWidgetPath);
      res.set({
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400', // Cache versioned files for 1 day
        'ETag': `"${widgetId}-v${version}"`,
      });
      return res.sendFile(deployedWidgetPath);
    } catch (accessError) {
      // No fallback - only serve from deployed widgets
      res.status(404).send('// Widget version not found');
      return;
    }
  } catch (error) {
    console.error('Error serving versioned widget:', error);
    res.status(404).send('// Widget version not found');
  }
});

// Main loader script endpoint
app.get('/cdn/loader.js', async (req, res) => {
  try {
    const loaderScript = await generateLoaderScript();
    res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.send(loaderScript);
  } catch (error) {
    console.error('Error generating loader script:', error);
    res.status(500).send('// Error loading widget');
  }
});

// Widget configuration endpoint
app.get('/cdn/widgets/:widgetId/config.json', async (req, res) => {
  try {
    const { widgetId } = req.params;
    
    // First try to serve from deployed configuration (latest version)
    const deployedWidgetsPath = path.join(__dirname, 'deployed-widgets', widgetId);
    
    try {
      const versions = await fs.readdir(deployedWidgetsPath);
      const latestVersion = versions.sort((a, b) => {
        const aNum = parseInt(a.replace('v', ''));
        const bNum = parseInt(b.replace('v', ''));
        return bNum - aNum;
      })[0];
      
      if (latestVersion) {
        const configPath = path.join(deployedWidgetsPath, latestVersion, 'config.json');
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        return res.json(config);
      }
    } catch (deployedError) {
      // Fallback to API server
    }
    
    // Fallback: proxy to the API server
    const apiUrl = `http://localhost:8000/api/v1/public/widgets/${widgetId}`;
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(apiUrl);
    const config = await response.json();
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching widget config:', error);
    res.status(404).json({ error: 'Widget not found' });
  }
});

// Widget deployment endpoint
app.post('/cdn/deploy', async (req, res) => {
  try {
    const widgetConfig = req.body;
    const { public_key, version } = widgetConfig;
    
    if (!public_key) {
      return res.status(400).json({ error: 'public_key is required' });
    }
    
    // Create directory structure for widget
    const widgetDir = path.join(__dirname, 'deployed-widgets', public_key);
    const versionDir = path.join(widgetDir, `v${version || 1}`);
    
    await fs.mkdir(versionDir, { recursive: true });
    
    // Save widget configuration
    const configPath = path.join(versionDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(widgetConfig, null, 2));
    
    // Copy widget.js file from build output to versioned location
    const sourceWidgetPath = path.join(__dirname, '../dist-widget/widget.js');
    const targetWidgetPath = path.join(versionDir, 'widget.js');
    
    try {
      await fs.copyFile(sourceWidgetPath, targetWidgetPath);
    } catch (copyError) {
      console.error('Widget.js file not found in dist-widget directory. Please run build first.');
      return res.status(400).json({ error: 'Widget build not found. Please run npm run build:widget first.' });
    }
    
    console.log(`Widget ${public_key} v${version} deployed successfully`);
    res.json({ 
      success: true, 
      message: 'Widget deployed successfully',
      cdn_url: `${getDynamicBaseUrl()}/cdn/widgets/${public_key}/v${version}/widget.js`
    });
    
  } catch (error) {
    console.error('Error deploying widget:', error);
    res.status(500).json({ error: 'Failed to deploy widget', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Generate the dynamic loader script
async function generateLoaderScript() {
  return `
(function() {
  'use strict';
  
  // Widget Loader v1.0.0
  // This script dynamically loads the appropriate widget based on configuration
  
  var widgetConfig = null;
  var widgetContainer = null;
  var launcherContainer = null;
  var isWidgetLoaded = false;
  
  // Get configuration from script attributes
  var scriptTag = document.querySelector('script[data-widget-id]');
  if (!scriptTag) {
    console.error('Reflect Widget: No script tag found with data-widget-id attribute');
    return;
  }
  
  var widgetId = scriptTag.getAttribute('data-widget-id');
  var version = scriptTag.getAttribute('data-version') || 'latest';
  var theme = scriptTag.getAttribute('data-theme') || 'light';
  var position = scriptTag.getAttribute('data-position') || 'bottom-right';
  
  if (!widgetId) {
    console.error('Reflect Widget: data-widget-id attribute is required');
    return;
  }
  
  // Set global config for widget
  window.reflectConfig = {
    key: widgetId,
    theme: theme,
    position: position
  };
  
  console.log('Reflect Widget Loader: Loading widget', widgetId);
  
  // Load widget configuration
  fetch('${getDynamicBaseUrl()}/cdn/widgets/' + widgetId + '/config.json')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Widget configuration not found');
      }
      return response.json();
    })
    .then(function(config) {
      widgetConfig = config;
      loadWidgetScript();
    })
    .catch(function(error) {
      console.error('Reflect Widget: Failed to load configuration', error);
    });
    
  function loadWidgetScript() {
    if (isWidgetLoaded) return;
    
    // Load the main widget script
    var script = document.createElement('script');
    script.src = '${getDynamicBaseUrl()}/cdn/widgets/widget.js';
    script.async = true;
    script.onload = function() {
      isWidgetLoaded = true;
      console.log('Reflect Widget: Loaded successfully');
    };
    script.onerror = function() {
      console.error('Reflect Widget: Failed to load widget script');
    };
    
    document.head.appendChild(script);
  }
})();
  `.trim();
}

function getDynamicBaseUrl() {
  // In development, use localhost
  // In production, this would be the actual CDN URL
  return process.env.NODE_ENV === 'production' 
    ? 'https://cdn.reflect.com' 
    : 'http://localhost:3001';
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('CDN Server Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`
🚀 Reflect Widget CDN Server running!
📡 URL: http://localhost:${PORT}
🔗 Loader: http://localhost:${PORT}/cdn/loader.js
🏥 Health: http://localhost:${PORT}/health
  `);
});

module.exports = app;