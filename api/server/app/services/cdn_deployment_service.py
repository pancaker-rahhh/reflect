import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any
from app.services.r2_storage_service import r2_storage_service, R2StorageService
from app.core.logging import get_logger
from app.core.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()

class CDNDeploymentService:
    def __init__(self, r2_service: R2StorageService = r2_storage_service):
        self.r2_service = r2_service
    
    async def deploy_widget(self, widget) -> bool:
        try:
            base_widget_content = await self._build_widget_content()
            config = self._prepare_widget_config(widget)
            widget_content_with_config = self._inject_config_into_widget(base_widget_content, config)
            
            upload_result = await self.r2_service.upload_widget_file(
                widget.public_key, 
                widget_content_with_config
            )
            
            cache_paths = [upload_result['widget_key']]
            await self.r2_service.purge_cdn_cache(cache_paths)
            
            logger.info(f"Successfully deployed widget {widget.public_key} with embedded configuration")
            return True
            
        except Exception as e:
            logger.error(f"Widget deployment failed for {widget.public_key}: {str(e)}")
            return False
    
    async def _build_widget_content(self) -> str:
        try:
            api_root = Path(__file__).parent.parent.parent.parent.parent
            client_dir = api_root / 'client'
            
            if not client_dir.exists():
                raise Exception(f"Client directory not found at {client_dir}")
            
            result = subprocess.run(
                ['npm', 'run', 'build:widget'],
                cwd=str(client_dir),
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode != 0:
                raise Exception(f"Widget build failed: {result.stderr}")
            
            widget_file = client_dir / 'dist-widget' / 'widget.js'
            if not widget_file.exists():
                raise Exception(f"Built widget file not found at {widget_file}")
            
            with open(widget_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            logger.info(f"Successfully built widget, size: {len(content)} bytes")
            return content
            
        except subprocess.TimeoutExpired:
            raise Exception("Widget build timed out")
        except Exception as e:
            logger.error(f"Widget build error: {str(e)}")
            raise
    
    def _prepare_widget_config(self, widget) -> Dict[str, Any]:
        return {
            'public_key': widget.public_key,
            'widget_type': str(widget.widget_type),
            'position': str(widget.position),
            'configuration': widget.configuration or {},
            'theme_configuration': widget.theme_configuration or {},
            'targeting_rules': widget.targeting_rules or [],
            'is_active': widget.is_active,
            'cdn_url': widget.cdn_url,
            'created_at': widget.created_at.isoformat() if widget.created_at else None,
            'updated_at': widget.updated_at.isoformat() if widget.updated_at else None
        }
    
    def _inject_config_into_widget(self, widget_content: str, config: Dict[str, Any]) -> str:
        import json
        
        config_json = json.dumps(config, indent=2)
        
        config_injection = f"""// Embedded widget configuration (injected at deployment time)
window.__REFLECT_WIDGET_CONFIG__ = {config_json};

// Override the fetch-based config loading with embedded config
const originalFetch = window.fetch;
window.fetch = function(url) {{
  // Intercept widget config requests and return embedded config
  if (url.includes('/public/widgets/')) {{
    return Promise.resolve({{
      ok: true,
      status: 200,
      json: () => Promise.resolve(window.__REFLECT_WIDGET_CONFIG__)
    }});
  }}
  // Pass through all other fetch requests
  return originalFetch.apply(this, arguments);
}};"""
        
        iife_start = widget_content.find(';(function () {')
        if iife_start != -1:
            insertion_point = widget_content.find('{', iife_start) + 1
            widget_with_config = (
                widget_content[:insertion_point] + 
                '\n' + config_injection + '\n' + 
                widget_content[insertion_point:]
            )
        else:
            widget_with_config = config_injection + '\n\n' + widget_content
        
        logger.info(f"Successfully injected configuration into widget for {config['public_key']}")
        return widget_with_config


cdn_deployment_service = CDNDeploymentService()
