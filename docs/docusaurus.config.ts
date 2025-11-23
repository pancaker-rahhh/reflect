import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Reflect Docs — Install, Integrations & Usage',
  tagline: 'Developer docs for Reflect: install the feedback widget, integrate with Slack/Jira, and use the API. Step-by-step guides for React, Vue and plain JS.',
  favicon: 'https://cdn.reflectfeedback.com/assets/logo-bg-removed.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.reflectfeedback.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Reflect', // Usually your GitHub org/user name.
  projectName: 'reflect', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Make docs the root
          breadcrumbs: true,
        },
        blog: false, // Disable blog since docs is now the root
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'https://cdn.reflectfeedback.com/assets/logo-bg-removed.svg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: 'Reflect Logo',
        src: 'https://cdn.reflectfeedback.com/assets/reflect-brand-bgremoved.svg',
        href: '/', // Link to home (intro page)
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'typescript', 'javascript', 'jsx', 'tsx', 'json', 'markdown', 'css', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
