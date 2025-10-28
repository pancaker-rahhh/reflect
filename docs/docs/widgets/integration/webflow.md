---
sidebar_position: 9
---

# Webflow Integration

Integrate [Reflect](https://reflectfeedback.com) feedback widget into your Webflow website. The widget is hosted on a CDN and can be easily integrated using Webflow's custom code feature.

## Quick Start

### Add Widget to Your Webflow Site

1. Open your Webflow project in the **Designer**
2. Go to **Project Settings** (gear icon ⚙️ in the top left)
3. Navigate to the **Custom Code** tab
4. Scroll down to the **Footer Code** section
5. Paste the following code:

```html
<!-- Reflect Feedback Widget -->
<script>
  window.reflectConfig = { key: "widget_eee5d255e1bc48d8", position: "bottom_right" };
</script>
<script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
```

6. Click **Save Changes**
7. **Publish** your site for the changes to take effect

:::tip
Replace `widget_eee5d255e1bc48d8` with your actual widget key from the Reflect dashboard.
:::

:::info
The widget will only appear on your published site, not in the Webflow Designer preview.
:::

That's it! The widget will now appear on all pages of your Webflow website.

## Alternative: Page-Specific Integration

If you want the widget to appear only on specific pages:

1. Open the page in the Webflow Designer
2. Go to **Page Settings** (gear icon at the top)
3. Navigate to the **Custom Code** tab
4. In the **Before &lt;/body&gt; tag** section, paste the widget code
5. Click **Save**
6. Publish your site

## Troubleshooting

### Widget not appearing

1. **Check your widget key**: Ensure you've replaced the example key with your actual widget key
2. **Publish your site**: The widget only appears on the published site, not in the Designer
3. **Clear Webflow cache**: In Project Settings, clear the cache and republish
4. **Check custom code limits**: Free Webflow plans have limitations on custom code
5. **Look for JavaScript errors**: Use browser developer tools (F12) to check the console

### Widget appearing multiple times

If you've added the code in both Project Settings and Page Settings, the widget might load twice. Use only one location.
