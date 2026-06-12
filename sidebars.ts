import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Overview',
      collapsed: false,
      items: ['intro'],
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['quickstart', 'getting-started', 'installation'],
    },
    {
      type: 'category',
      label: 'Operating a2a-gateway',
      collapsed: false,
      items: [
        'configuration',
        'runtime-model',
        'api-or-protocols',
        'deployment',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: ['architecture'],
    },
    {
      type: 'category',
      label: 'Security & Observability',
      collapsed: false,
      items: ['security', 'observability'],
    },
    {
      type: 'category',
      label: 'Development',
      collapsed: false,
      items: ['development', 'testing'],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: ['troubleshooting', 'faq'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/commands',
        'reference/configuration-reference',
        'reference/environment-variables',
        'reference/repository-map',
        'reference/glossary',
      ],
    },
  ],
};

export default sidebars;
