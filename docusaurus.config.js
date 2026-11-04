// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Xiaoxuan's World",
  tagline: 'A personal space for notes and discoveries',
  url: 'https://xuaner233.github.io',
  baseUrl: '/',
  organizationName: 'xuaner233',
  projectName: 'xuaner233.github.io',
  onBrokenLinks: 'throw',
  markdown: {format: 'md'},
  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          routeBasePath: '/',
          blogTitle: "Xiaoxuan's World",
          blogDescription: 'Notes and discoveries by Xiaoxuan',
          showReadingTime: true,
          onInlineTags: 'ignore',
          onInlineAuthors: 'ignore',
        },
        theme: {customCss: './src/css/custom.css'},
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "Xiaoxuan's World",
      items: [
        {to: '/archive', label: 'Archive', position: 'left'},
        {to: '/tags', label: 'Tags', position: 'left'},
        {to: '/about', label: 'About', position: 'left'},
        {href: 'https://github.com/xuaner233', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Xiaoxuan Liu.`,
    },
  },
};

module.exports = config;
