import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'a2a-gateway',
  tagline: 'Gateway documentation for agent-to-agent communication',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://ashuangiras.github.io',
  baseUrl: '/a2a-gateway-docs/',
  organizationName: 'ashuangiras',
  projectName: 'a2a-gateway-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
          editUrl: 'https://github.com/ashuangiras/a2a-gateway-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'a2a-gateway',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/ashuangiras/a2a-gateway',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Configuration', to: '/docs/configuration' },
            { label: 'Architecture', to: '/docs/architecture' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'Commands', to: '/docs/reference/commands' },
            { label: 'Configuration Reference', to: '/docs/reference/configuration-reference' },
            { label: 'Glossary', to: '/docs/reference/glossary' },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/ashuangiras/a2a-gateway',
            },
            {
              label: 'Issues',
              href: 'https://github.com/ashuangiras/a2a-gateway/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ashu Angiras. Maintained by Ashu Angiras. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'go'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
