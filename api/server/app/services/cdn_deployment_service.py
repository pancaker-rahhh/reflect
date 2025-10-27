import asyncio
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

    async def deploy_widget(self, widget, max_retries: int = 3) -> bool:
        for attempt in range(max_retries + 1):
            try:
                base_widget_content = await self._build_widget_content()
                config = self._prepare_widget_config(widget)
                widget_content_with_config = self._inject_config_into_widget(
                    base_widget_content, config
                )

                upload_result = await self.r2_service.upload_widget_file(
                    widget.public_key, widget_content_with_config
                )

                cache_paths = [upload_result['widget_key']]
                await self.r2_service.purge_cdn_cache(cache_paths)

                logger.info(
                    f'Successfully deployed widget {widget.public_key} with embedded configuration'
                )
                return True

            except Exception as e:
                if attempt < max_retries:
                    delay = (2**attempt) * 1  # Exponential backoff: 1s, 2s, 4s
                    logger.error(
                        f'Widget deployment attempt {attempt + 1} failed for {widget.public_key}: {str(e)}. Retrying in {delay}s...'
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error(
                        f'Widget deployment failed for {widget.public_key} after {max_retries + 1} attempts: {str(e)}'
                    )
                    return False

    async def delete_widget(self, public_key: str) -> bool:
        """Delete widget files from CDN/R2 storage."""
        try:
            success = await self.r2_service.delete_widget_files(public_key)

            # Purge CDN cache for the deleted files
            if success:
                cache_paths = [f'widgets/{public_key}/widget.js']
                # Also purge any potential config.json files that might exist
                cache_paths.append(f'widgets/{public_key}/config.json')
                await self.r2_service.purge_cdn_cache(cache_paths)
                logger.info(f'CDN cache purged for widget {public_key}')

            return success
        except Exception as e:
            logger.error(f'CDN deletion error for {public_key}: {str(e)}')
            return False

    async def _build_widget_content(self) -> str:
        try:
            # Widget file is always within the API server directory
            server_dir = Path(__file__).parent.parent.parent
            widget_file = server_dir / 'widget.js'

            if not widget_file.exists():
                raise Exception(
                    f'Built widget file not found at {widget_file}. Please ensure widget.js is present in the server directory.'
                )

            with open(widget_file, 'r', encoding='utf-8') as f:
                content = f.read()

            logger.info(
                f'Successfully loaded pre-built widget from {widget_file}, size: {len(content)} bytes'
            )
            return content

        except Exception as e:
            logger.error(f'Widget loading error: {str(e)}')
            raise

    def _prepare_widget_config(self, widget) -> Dict[str, Any]:
        return {
            'public_key': widget.public_key,
            'widget_type': str(widget.widget_type),
            'position': str(widget.position),
            'configuration': widget.configuration or {},
            'theme_configuration': widget.theme_configuration or {},
            'targeting_rules': widget.targeting_rules or [],
            'cdn_url': widget.cdn_url,
            'created_at': widget.created_at.isoformat() if widget.created_at else None,
            'updated_at': widget.updated_at.isoformat() if widget.updated_at else None,
        }

    def _inject_config_into_widget(
        self, widget_content: str, config: Dict[str, Any]
    ) -> str:
        import json

        config_json = json.dumps(config, indent=2)

        config_injection = f"""// Embedded widget configuration (injected at deployment time)
window.__REFLECT_WIDGET_CONFIG__ = {config_json};

// Override the fetch-based config loading with embedded config
const originalFetch = window.fetch;
window.fetch = function(url) {{
  // This regex is specifically designed to match ONLY the initial widget configuration URL.
  // It looks for a URL path that ends with `/public/widgets/widget_` followed by an alphanumeric key.
  // It will NOT match the other API calls for fetching feedback items, like those ending in `/reviews` or containing `?feedback_type=`.
  const configUrlRegex = /\\/public\\/widgets\\/widget_[a-f0-9]+$/;

  try {{
    const parsedUrl = new URL(url);
    // Intercept ONLY the main widget config request by testing its path against the regex.
    if (configUrlRegex.test(parsedUrl.pathname)) {{
      console.log('Reflect Widget: Intercepting initial config fetch:', url);
      return Promise.resolve({{
        ok: true,
        status: 200,
        json: () => Promise.resolve(window.__REFLECT_WIDGET_CONFIG__)
      }});
    }}
  }} catch (error) {{
    // If URL parsing fails, it's not a standard HTTP URL, so we let it pass through.
    // This can happen with data URIs or other non-standard requests.
  }}

  // Pass through all other fetch requests (e.g., to fetch bug reports, feature requests) to the original fetch function.
  console.log('Reflect Widget: Passing through API call:', url);
  return originalFetch.apply(this, arguments);
}};"""

        iife_start = widget_content.find(';(function () {')
        if iife_start != -1:
            insertion_point = widget_content.find('{', iife_start) + 1
            widget_with_config = (
                widget_content[:insertion_point]
                + '\n'
                + config_injection
                + '\n'
                + widget_content[insertion_point:]
            )
        else:
            widget_with_config = config_injection + '\n\n' + widget_content

        logger.info(
            f'Successfully injected configuration into widget for {config["public_key"]}'
        )
        return widget_with_config


cdn_deployment_service = CDNDeploymentService()
