---
sidebar_position: 1
---

# Widget Integration Guide

Learn how to integrate Reflect feedback widgets into your application, regardless of the framework or platform you're using.

## Overview

Reflect widgets are framework-agnostic and can be integrated into any web application. We provide specific guides and examples for popular frameworks to make integration as smooth as possible.

## Choose Your Platform

Select your framework or platform to get started:

- [**Vanilla JavaScript**](/docs/widgets/integration/vanilla-js) - Pure HTML/JS integration
- [**React**](/docs/widgets/integration/react) - React 16.8+ with hooks
- [**Vue**](/docs/widgets/integration/vue) - Vue 3 and Vue 2
- [**Angular**](/docs/widgets/integration/angular) - Angular 12+
- [**Next.js**](/docs/widgets/integration/next-js) - Next.js 13+ with App Router
- [**Svelte**](/docs/widgets/integration/svelte) - Svelte 3+
- [**WordPress**](/docs/widgets/integration/wordpress) - WordPress plugin integration

## Basic Integration

All integrations follow the same basic pattern:

1. **Configure** the widget with your settings
2. **Load** the widget script
3. **Initialize** (optional, for framework integrations)

```html
<script>
  window.reflectConfig = { key: "widget_abc123" };
</script>
<script async src="https://cdn.reflect.app/widgets/widget_abc123/widget.js"></script>
```

## Next Steps

- Choose your framework guide from the list above
- Learn about [Widget Configuration](/docs/widgets/configuration/basic)
- Explore [Widget Types](/docs/widgets/types/feedback)
