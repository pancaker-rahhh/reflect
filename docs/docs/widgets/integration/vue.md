---
sidebar_position: 3
---

# Vue Integration

# Vue Integration

Integration guide for Vue 3 and Vue 2 applications.

## Vue 3 Composition API

### Method 1: Global Loading in main.js

Load the widget globally in your main application file:

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Configure and load Reflect widget
window.reflectConfig = {
  key: "widget_eee5d255e1bc48d8",
  position: "bottom_right"
};

const script = document.createElement('script');
script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
script.async = true;
document.body.appendChild(script);

app.mount('#app')
```

### Method 2: Using onMounted in App.vue

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>Welcome to Vue 3</h1>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Configure widget
  window.reflectConfig = {
    key: "widget_eee5d255e1bc48d8",
    position: "bottom_right"
  };

  // Load widget script
  const script = document.createElement('script');
  script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
  script.async = true;
  document.body.appendChild(script);
})
</script>
```

### Method 3: Vue Component

Create a dedicated component for the widget:

```vue
<!-- src/components/ReflectWidget.vue -->
<template>
  <!-- This component doesn't render anything -->
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

interface Props {
  widgetKey?: string
  position?: string
}

const props = withDefaults(defineProps<Props>(), {
  widgetKey: "widget_eee5d255e1bc48d8",
  position: "bottom_right"
})

let scriptElement: HTMLScriptElement | null = null

onMounted(() => {
  // Set configuration
  window.reflectConfig = {
    key: props.widgetKey,
    position: props.position
  };

  // Create and load script
  scriptElement = document.createElement('script');
  scriptElement.src = `https://cdn.reflectfeedback.com/widgets/${props.widgetKey}/widget.js`;
  scriptElement.async = true;
  document.body.appendChild(scriptElement);
})

onUnmounted(() => {
  if (scriptElement && document.body.contains(scriptElement)) {
    document.body.removeChild(scriptElement);
  }
})
</script>
```

Use it in your app:

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>My Vue App</h1>
    <ReflectWidget widget-key="widget_eee5d255e1bc48d8" position="bottom_right" />
  </div>
</template>

<script setup>
import ReflectWidget from './components/ReflectWidget.vue'
</script>
```

## Vue 2 Options API

### Method 1: Global Loading in main.js

```javascript
// src/main.js
import Vue from 'vue'
import App from './App.vue'

// Configure and load Reflect widget
window.reflectConfig = {
  key: "widget_eee5d255e1bc48d8",
  position: "bottom_right"
};

const script = document.createElement('script');
script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
script.async = true;
document.body.appendChild(script);

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### Method 2: Using mounted in App.vue

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>Welcome to Vue 2</h1>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Configure widget
    window.reflectConfig = {
      key: "widget_eee5d255e1bc48d8",
      position: "bottom_right"
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
    script.async = true;
    this.$el.appendChild(script);
  }
}
</script>
```

### Method 3: Vue Component

```vue
<!-- src/components/ReflectWidget.vue -->
<template>
  <!-- This component doesn't render anything -->
</template>

<script>
export default {
  name: 'ReflectWidget',
  props: {
    widgetKey: {
      type: String,
      default: "widget_eee5d255e1bc48d8"
    },
    position: {
      type: String,
      default: "bottom_right"
    }
  },
  mounted() {
    // Set configuration
    window.reflectConfig = {
      key: this.widgetKey,
      position: this.position
    };

    // Create and load script
    this.scriptElement = document.createElement('script');
    this.scriptElement.src = `https://cdn.reflectfeedback.com/widgets/${this.widgetKey}/widget.js`;
    this.scriptElement.async = true;
    document.body.appendChild(this.scriptElement);
  },
  beforeDestroy() {
    if (this.scriptElement && document.body.contains(this.scriptElement)) {
      document.body.removeChild(this.scriptElement);
    }
  }
}
</script>
```

## Vue Router Integration

If using Vue Router, you can conditionally load the widget based on the route:

```javascript
// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    // your routes
  ]
})

// Load widget only on specific routes
router.afterEach((to, from) => {
  if (to.name === 'feedback-page') {
    if (!window.reflectConfig) {
      window.reflectConfig = {
        key: "widget_eee5d255e1bc48d8",
        position: "bottom_right"
      };

      const script = document.createElement('script');
      script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }
})

export default router
```

## TypeScript Support

Add type declarations:

```typescript
// src/types/reflect.d.ts
interface ReflectConfig {
  key: string;
  position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
  offset?: { x: number; y: number };
  autoShow?: boolean;
  showAfter?: number;
  hideOnSubmit?: boolean;
  debug?: boolean;
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

Include in your TypeScript config:

```json
{
  "compilerOptions": {
    "types": ["reflect"]
  }
}
```

## Programmatic Control

Control the widget programmatically using the global Reflect API:

```vue
<template>
  <div>
    <button @click="showWidget">Show Widget</button>
    <button @click="hideWidget">Hide Widget</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const widgetLoaded = ref(false)

onMounted(() => {
  window.reflectConfig = {
    key: "widget_eee5d255e1bc48d8",
    position: "bottom_right"
  };

  const script = document.createElement('script');
  script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
  script.async = true;
  document.body.appendChild(script);

  // Listen for widget load
  window.addEventListener('reflectLoaded', () => {
    widgetLoaded.value = true;
  });
})

function showWidget() {
  if (widgetLoaded.value && window.Reflect) {
    window.Reflect.show();
  }
}

function hideWidget() {
  if (widgetLoaded.value && window.Reflect) {
    window.Reflect.hide();
  }
}
</script>
```

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
