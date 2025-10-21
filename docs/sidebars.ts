import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Getting Started and General Documentation
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/overview',
        'getting-started/quick-start',
        'getting-started/installation',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/cdn-deployment',
        'architecture/database',
      ],
    },
  ],

  // Widget-specific documentation
  widgetSidebar: [
    'widgets/intro',
    {
      type: 'category',
      label: 'Widget Integration',
      items: [
        'widgets/integration/vanilla-js',
        'widgets/integration/react',
        'widgets/integration/vue',
        'widgets/integration/angular',
        'widgets/integration/next-js',
        'widgets/integration/svelte',
        'widgets/integration/wordpress',
      ],
    },
    {
      type: 'category',
      label: 'Widget Types',
      items: [
        'widgets/types/feedback',
        'widgets/types/nps',
        'widgets/types/csat',
        'widgets/types/ces',
        'widgets/types/review',
        'widgets/types/bug-report',
        'widgets/types/feature-request',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'widgets/configuration/basic',
        'widgets/configuration/styling',
        'widgets/configuration/targeting',
        'widgets/configuration/advanced',
      ],
    },
    'widgets/build-process',
    'widgets/architecture',
  ],

  // API documentation
  apiSidebar: [
    'api/intro',
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/authentication',
        'api/widgets',
        'api/feedback',
        'api/rate-limiting',
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      items: [
        'api/backend/setup',
        'api/backend/database',
        'api/backend/services',
      ],
    },
  ],
};

export default sidebars;
