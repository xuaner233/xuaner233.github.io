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
  markdown: {format: 'detect'},
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        createRedirects(existingPath) {
          if (existingPath.startsWith('/blog/')) {
            return existingPath.slice('/blog'.length);
          }
          return undefined;
        },
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {sidebarPath: './sidebars.js'},
        blog: {
          routeBasePath: '/blog',
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
        {to: '/docs', label: 'Docs', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/about', label: 'About', position: 'left'},
        {href: 'https://github.com/xuaner233', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Explore',
          items: [
            {label: 'Docs', to: '/docs'},
            {label: 'Blog', to: '/blog'},
            {label: 'Archive', to: '/blog/archive'},
            {label: 'Tags', to: '/blog/tags'},
            {label: 'About', to: '/about'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Xiaoxuan Liu.`,
    },
  },
};

module.exports = config;
