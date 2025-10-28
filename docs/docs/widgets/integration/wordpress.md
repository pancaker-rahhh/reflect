---
sidebar_position: 7
---

# WordPress Integration

Integrate Reflect feedback widget into your WordPress site. The widget is hosted on a CDN and can be easily integrated using several methods.

## Quick Start

The simplest way to integrate the Reflect widget is to add it directly to your theme's template file.

### Method 1: Add to footer.php (Recommended)

Edit your theme's `footer.php` file and add the scripts before the closing `</body>` tag:

```php
<!-- footer.php -->
    <?php wp_footer(); ?>
    
    <!-- Reflect Widget -->
    <script>
      window.reflectConfig = { key: "widget_eee5d255e1bc48d8", position: "bottom_right" };
    </script>
    <script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
  </body>
</html>
```

### Method 2: Using wp_enqueue_script in functions.php

Add the widget to your theme's `functions.php` file:

```php
<?php
// functions.php

function enqueue_reflect_widget() {
    // Only load on frontend
    if (!is_admin()) {
        // Add inline configuration script
        wp_add_inline_script('wp-footer', '
            window.reflectConfig = {
                key: "widget_eee5d255e1bc48d8",
                position: "bottom_right"
            };
        ');

        // Enqueue the widget script
        wp_enqueue_script(
            'reflect-widget',
            'https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js',
            array(),
            null,
            true // Load in footer
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_reflect_widget');
```

:::tip
Replace `widget_eee5d255e1bc48d8` with your actual widget key from the Reflect dashboard.
:::

That's it! The widget will now appear on all pages of your WordPress site.

## Troubleshooting

### Widget not appearing

1. **Check your widget key**: Ensure the widget key is correct
2. **Verify scripts are loading**: Use browser developer tools (F12) to check the Network tab
3. **Check theme compatibility**: Ensure your theme calls `wp_head()` and `wp_footer()`
4. **Look for JavaScript errors**: Check the Console tab in developer tools for any errors

### Widget appearing multiple times

If you're using multiple methods, the widget might load multiple times. Choose one method and remove the others.

### Caching issues

If using a caching plugin (WP Super Cache, W3 Total Cache, etc.), clear the cache after adding the widget.
