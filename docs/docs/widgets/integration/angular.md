---
sidebar_position: 4
---

# Angular Integration

Integration guide for Angular 12+ applications.

## Method 1: Add to index.html

The simplest way is to add the widget scripts directly to your `index.html` file.

```html
<!-- src/index.html -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Angular App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>

  <!-- Reflect Widget Configuration -->
  <script>
    window.reflectConfig = {
      key: "widget_eee5d255e1bc48d8",
      position: "bottom_right"
    };
  </script>
  <script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
</body>
</html>
```

## Method 2: Angular Service

Create a service to manage the widget loading:

```typescript
// src/app/services/reflect-widget.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReflectWidgetService {
  private scriptLoaded = false;

  loadWidget(config: { key: string; position?: string }): void {
    if (this.scriptLoaded) return;

    // Set configuration
    (window as any).reflectConfig = config;

    // Create and load script
    const script = document.createElement('script');
    script.src = `https://cdn.reflectfeedback.com/widgets/${config.key}/widget.js`;
    script.async = true;
    document.body.appendChild(script);

    this.scriptLoaded = true;
  }

  unloadWidget(): void {
    if (!this.scriptLoaded) return;

    const scripts = document.querySelectorAll('script[src*="reflectfeedback.com"]');
    scripts.forEach(script => script.remove());

    this.scriptLoaded = false;
  }
}
```

Use it in your app component:

```typescript
// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { ReflectWidgetService } from './services/reflect-widget.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'your-angular-app';

  constructor(private reflectWidget: ReflectWidgetService) {}

  ngOnInit(): void {
    this.reflectWidget.loadWidget({
      key: 'widget_eee5d255e1bc48d8',
      position: 'bottom_right'
    });
  }
}
```

## Method 3: Angular Component

Create a dedicated component for the widget:

```typescript
// src/app/components/reflect-widget.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-reflect-widget',
  template: '',
  styles: []
})
export class ReflectWidgetComponent implements OnInit, OnDestroy {
  @Input() widgetKey!: string;
  @Input() position: string = 'bottom_right';

  private scriptElement?: HTMLScriptElement;

  ngOnInit(): void {
    // Set configuration
    (window as any).reflectConfig = {
      key: this.widgetKey,
      position: this.position
    };

    // Load script
    this.scriptElement = document.createElement('script');
    this.scriptElement.src = `https://cdn.reflectfeedback.com/widgets/${this.widgetKey}/widget.js`;
    this.scriptElement.async = true;
    document.body.appendChild(this.scriptElement);
  }

  ngOnDestroy(): void {
    if (this.scriptElement && document.body.contains(this.scriptElement)) {
      document.body.removeChild(this.scriptElement);
    }
  }
}
```

Use it in your template:

```html
<!-- src/app/app.component.html -->
<div class="app-container">
  <h1>Welcome to Angular</h1>
  <app-reflect-widget
    widgetKey="widget_eee5d255e1bc48d8"
    position="bottom_right">
  </app-reflect-widget>
</div>
```

## TypeScript Declarations

Add type declarations to avoid TypeScript errors:

```typescript
// src/types/reflect.d.ts
interface ReflectConfig {
  key: string;
  position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
  offset?: { x: number; y: number };
  autoShow?: boolean;
}

interface ReflectAPI {
  show(): void;
  hide(): void;
  open(): void;
  close(): void;
  identify(user: { userId: string; email?: string; name?: string }): void;
}

declare global {
  interface Window {
    reflectConfig: ReflectConfig;
    Reflect: ReflectAPI;
  }
}
```

Include the declarations in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["reflect"]
  }
}
```

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
