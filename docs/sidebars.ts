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
  // Main documentation sidebar - unified structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Frameworks',
      collapsed: false,
      items: [
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
      label: 'Features',
      items: [
        'widgets/features/feedback',
        'widgets/features/nps',
        'widgets/features/csat',
        'widgets/features/ces',
        'widgets/features/review',
        'widgets/features/bug-report',
        'widgets/features/feature-request',
      ],
    },
    'community',
  ],
};

export default sidebars;
