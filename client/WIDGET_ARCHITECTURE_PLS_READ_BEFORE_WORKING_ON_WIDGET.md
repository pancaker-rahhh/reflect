# Widget related details

## How Widgets Work

- Widgets are built from `client/src/widget.tsx` and deployed as standalone JavaScript files. 
- The same core logic (`WidgetCore.tsx`) powers both the live preview during creation and the production widget.

## Widget Creation

- **Frontend**: Multi-step wizard in `WidgetCreate.tsx` with form validation
- **Backend**: API creates widget, generates embed code, and deploys to CDN
- **Database**: Stores configuration, theme, and targeting rules

## Build Process

```bash
# Development
npm run dev:widget

# Production build
npm run build:widget
```

The build process:
1. Compiles `widget.tsx` with Vite using Preact (smaller than React)
2. Inlines and scopes CSS to prevent conflicts
3. Outputs single `widget.js` file for CDN deployment

## Widget Types

- **FEEDBACK** - General feedback
- **NPS/CSAT/CES** - Survey types
- **REVIEW** - Product reviews
- **BUG_REPORT** - Bug reporting
- **FEATURE_REQUEST** - Feature requests

### Embed Code

```html
<script>
  window.reflectConfig = { key: "widget_abc123", position: "bottom_right" };
</script>
<script async src="https://your-domain.r2.dev/widgets/widget_abc123/widget.js"></script>
```

### Key Files

- `client/src/widget.tsx` - Widget source code
- `client/src/components/widgets/core/WidgetCore.tsx` - Core widget component
- `api/server/app/services/widget_service.py` - Backend widget logic
- `api/server/app/services/cdn_deployment_service.py` - CDN deployment

## NOTE
Everytime you make changes to WidgetCore or widget.tsx, then you need to build a new widget, and place that one in API for the build process to take the latest widget.js file

THANKS FOR READING
WITH LOVE, PATIENCE, CARE 
INDIRA