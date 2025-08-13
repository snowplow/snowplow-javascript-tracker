// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Snowplow Javascript API Docs',
  favicon: 'img/favicon.ico',
  url: 'http://snowplow.github.io',
  baseUrl: '/snowplow-javascript-tracker/',
  organizationName: 'snowplow',
  projectName: 'snowplow-javascript-tracker',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'API Docs',
        logo: {
          src: 'img/favicon.ico',
          href: '/docs',
          target: '_self',
        },
        items: [
          {
            href: 'https://github.com/snowplow/snowplow-javascript-tracker',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Snowplow JS Docs',
                to: 'https://docs.snowplow.io/docs/sources/trackers/web-trackers/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Community',
                href: 'https://community.snowplow.io/',
              },
              {
                label: 'Website',
                href: 'https://snowplow.io/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/snowplow/snowplow-javascript-tracker',
              },
            ],
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
