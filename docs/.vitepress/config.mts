import { defineConfig } from 'vitepress';

/** GitHub Pages project URL: https://bankersman.github.io/workbench-inventory/ */
const defaultBase = '/workbench-inventory/';

function normalizeBase(raw: string): string {
  let b = raw.trim();
  if (!b.startsWith('/')) {
    b = `/${b}`;
  }
  return b.endsWith('/') ? b : `${b}/`;
}

const base = normalizeBase(process.env.VITEPRESS_BASE ?? defaultBase);

export default defineConfig({
  title: 'Workbench Inventory',
  description: 'NestJS API and React kiosk for workshop inventory',
  base,
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/bankersman/workbench-inventory',
      },
    ],
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Install & run',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Docker (GHCR)', link: '/guide/docker' },
          { text: 'Raspberry Pi (native)', link: '/guide/raspberry-pi-native' },
          { text: 'Hardware scanner', link: '/guide/hardware-scanner' },
        ],
      },
      { text: 'Configuration', link: '/guide/configuration' },
      { text: 'Usage', link: '/guide/usage' },
      { text: 'Development', link: '/guide/development' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          {
            text: 'Install & run',
            collapsed: false,
            items: [
              { text: 'Getting started', link: '/guide/getting-started' },
              { text: 'Docker (GHCR)', link: '/guide/docker' },
              { text: 'Raspberry Pi (native)', link: '/guide/raspberry-pi-native' },
              { text: 'Hardware scanner', link: '/guide/hardware-scanner' },
            ],
          },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Usage', link: '/guide/usage' },
          { text: 'Development', link: '/guide/development' },
        ],
      },
    ],
  },
});
