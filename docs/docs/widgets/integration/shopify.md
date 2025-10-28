---
sidebar_position: 10
---

# Shopify Integration

Integrate Reflect feedback widget into your Shopify store. The widget is hosted on a CDN and can be easily integrated by editing your theme files.

## Quick Start

### Add Widget to Your Shopify Store

1. Go to your **Shopify admin panel**
2. Navigate to **Online Store** → **Themes**
3. Find your active theme and click **Actions** → **Edit code**
4. In the left sidebar, locate and open the `theme.liquid` file (usually under **Layout**)
5. Scroll to the bottom and find the closing `</body>` tag
6. Paste the following code **just before** the `</body>` tag:

```html
<!-- Reflect Feedback Widget -->
<script>
  window.reflectConfig = { key: "widget_eee5d255e1bc48d8", position: "bottom_right" };
</script>
<script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
```

7. Click **Save**
8. Visit your store to see the widget in action

:::tip
Replace `widget_eee5d255e1bc48d8` with your actual widget key from the Reflect dashboard.
:::

:::warning Important
Always backup your theme before making changes. Consider creating a duplicate theme for testing first.
:::

That's it! The widget will now appear on all pages of your Shopify store.

## Best Practices

### Create a Theme Backup

Before editing your theme:

1. In **Themes**, click **Actions** on your active theme
2. Select **Duplicate**
3. You now have a backup you can restore if needed

### Test Before Going Live

1. Duplicate your theme
2. Add the widget code to the duplicate
3. Preview the duplicate theme
4. If everything looks good, publish the duplicate theme

## Troubleshooting

### Widget not appearing

1. **Check your widget key**: Ensure you've replaced the example key with your actual widget key
2. **Verify placement**: Make sure the code is placed just before `</body>` in `theme.liquid`
3. **Clear cache**: Clear your browser cache and try in an incognito window
4. **Check for errors**: Open browser developer tools (F12) and look for JavaScript errors in the console
5. **Theme compatibility**: Some heavily customized themes might require different placement

### Widget conflicts with Shopify apps

If you experience conflicts with other Shopify apps:

1. Check the console for JavaScript errors
2. Try adjusting the widget position (e.g., change from `bottom_right` to `bottom_left`)
3. Contact Reflect support if issues persist

### Changes not appearing

1. **Save the file**: Make sure you clicked "Save" after adding the code
2. **Hard refresh**: Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Clear Shopify cache**: Theme changes can take a few minutes to propagate
