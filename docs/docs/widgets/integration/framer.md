---
sidebar_position: 8
---

# Framer Integration

Integrate [Reflect](https://reflectfeedback.com) feedback widget into your Framer website. The widget is hosted on a CDN and can be easily integrated using Framer's custom code feature.

## Quick Start

### Add Widget to Your Framer Site

1. Open your Framer project
2. Click on the **Settings** icon (⚙️) in the toolbar
3. Go to the **General** tab
4. Scroll down to find the **Custom Code** section
5. Click on **End of &lt;/body&gt; tag**
6. Paste the following code:

```html
<!-- Reflect Feedback Widget -->
<script>
  window.reflectConfig = { key: "widget_eee5d255e1bc48d8", position: "bottom_right" };
</script>
<script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
```

7. Click **Save**
8. Publish your site to see the widget in action

:::tip
Replace `widget_eee5d255e1bc48d8` with your actual widget key from the Reflect dashboard.
:::

:::info
The widget will only appear on your published site, not in the Framer editor preview.
:::

That's it! The widget will now appear on all pages of your Framer website.

## Troubleshooting

### Widget not appearing

1. **Check your widget key**: Ensure you've replaced the example key with your actual widget key
2. **Publish your site**: The widget only appears on the published site, not in the editor
3. **Clear browser cache**: Try viewing in an incognito/private window
4. **Check the console**: Open browser developer tools (F12) and look for JavaScript errors

### Widget appearing multiple times

Make sure you've only added the code once in the Custom Code section.
