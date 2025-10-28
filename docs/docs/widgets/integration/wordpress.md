---
sidebar_position: 7
---

# WordPress Integration

# WordPress Integration

Integration guide for WordPress sites.

## Method 1: Using wp_enqueue_script (Recommended)

Add the widget to your theme's `functions.php` file:

```php
<?php
// functions.php

function enqueue_reflect_widget() {
    // Only load on frontend
    if (!is_admin()) {
        // Add configuration script
        wp_add_inline_script('reflect-config', '
            window.reflectConfig = {
                key: "widget_eee5d255e1bc48d8",
                position: "bottom_right"
            };
        ', 'before');

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

## Method 2: Direct HTML in header.php

Edit your theme's `header.php` file and add the scripts before the closing `</head>` tag:

```php
<!-- header.php -->
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">

    <?php wp_head(); ?>

    <!-- Reflect Widget Configuration -->
    <script>
        window.reflectConfig = {
            key: "widget_eee5d255e1bc48d8",
            position: "bottom_right"
        };
    </script>
    <script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
</head>
<body <?php body_class(); ?>>
```

## Method 3: Using a Custom Plugin

Create a simple plugin to manage the widget:

```php
<?php
/**
 * Plugin Name: Reflect Widget
 * Description: Adds Reflect feedback widget to your WordPress site
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ReflectWidgetPlugin {
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function enqueue_scripts() {
        if (!is_admin()) {
            $widget_key = get_option('reflect_widget_key', 'widget_eee5d255e1bc48d8');
            $position = get_option('reflect_widget_position', 'bottom_right');

            // Add configuration
            wp_add_inline_script('reflect-config', "
                window.reflectConfig = {
                    key: '{$widget_key}',
                    position: '{$position}'
                };
            ", 'before');

            // Enqueue widget script
            wp_enqueue_script(
                'reflect-widget',
                "https://cdn.reflectfeedback.com/widgets/{$widget_key}/widget.js",
                array(),
                null,
                true
            );
        }
    }

    public function add_admin_menu() {
        add_options_page(
            'Reflect Widget Settings',
            'Reflect Widget',
            'manage_options',
            'reflect-widget',
            array($this, 'settings_page')
        );
    }

    public function register_settings() {
        register_setting('reflect_widget_options', 'reflect_widget_key');
        register_setting('reflect_widget_options', 'reflect_widget_position');
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>Reflect Widget Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('reflect_widget_options'); ?>
                <?php do_settings_sections('reflect_widget_options'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">Widget Key</th>
                        <td>
                            <input type="text"
                                   name="reflect_widget_key"
                                   value="<?php echo esc_attr(get_option('reflect_widget_key', 'widget_eee5d255e1bc48d8')); ?>"
                                   class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Position</th>
                        <td>
                            <select name="reflect_widget_position">
                                <option value="bottom_right" <?php selected(get_option('reflect_widget_position'), 'bottom_right'); ?>>Bottom Right</option>
                                <option value="bottom_left" <?php selected(get_option('reflect_widget_position'), 'bottom_left'); ?>>Bottom Left</option>
                                <option value="top_right" <?php selected(get_option('reflect_widget_position'), 'top_right'); ?>>Top Right</option>
                                <option value="top_left" <?php selected(get_option('reflect_widget_position'), 'top_left'); ?>>Top Left</option>
                            </select>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

// Initialize the plugin
new ReflectWidgetPlugin();
```

## Method 4: Using a Page Builder

### Elementor

1. Add an HTML widget to your page/template
2. Paste the following code:

```html
<!-- Reflect Widget Configuration -->
<script>
  window.reflectConfig = {
    key: "widget_eee5d255e1bc48d8",
    position: "bottom_right"
  };
</script>
<script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
```

### Gutenberg Block

Create a custom block or use the HTML block:

```html
<!-- Reflect Widget -->
<script>
  window.reflectConfig = {
    key: "widget_eee5d255e1bc48d8",
    position: "bottom_right"
  };
</script>
<script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
```

## Method 5: Conditional Loading

Load the widget only on specific pages:

```php
// functions.php

function enqueue_reflect_widget_conditional() {
    // Only load on specific pages
    if (is_page('contact') || is_single() || is_front_page()) {
        wp_add_inline_script('reflect-config', '
            window.reflectConfig = {
                key: "widget_eee5d255e1bc48d8",
                position: "bottom_right"
            };
        ', 'before');

        wp_enqueue_script(
            'reflect-widget',
            'https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js',
            array(),
            null,
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_reflect_widget_conditional');
```

## Troubleshooting

### Widget not appearing

1. Check that your widget key is correct
2. Ensure scripts are loading (check browser developer tools)
3. Verify that `wp_head()` and `wp_footer()` are called in your theme
4. Check for JavaScript errors in the console

### Widget appearing multiple times

If using multiple methods, the widget might load multiple times. Stick to one method.

### Caching issues

If using a caching plugin, clear the cache after adding the widget.

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
