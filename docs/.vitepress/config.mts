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
        text: 'Getting started',
        items: [
          { text: 'Overview', link: '/guide/getting-started/' },
          { text: 'Docker (GHCR)', link: '/guide/docker' },
          { text: 'Raspberry Pi (native)', link: '/guide/raspberry-pi-native' },
          { text: 'Local development', link: '/guide/getting-started/local' },
        ],
      },
      {
        text: 'Hardware',
        items: [
          { text: 'Brother QL labels', link: '/guide/hardware/printers' },
          { text: 'USB barcode scanner', link: '/guide/hardware/scanner' },
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
            text: 'Getting started',
            collapsed: false,
            items: [
              { text: 'Overview', link: '/guide/getting-started/' },
              { text: 'Docker (GHCR)', link: '/guide/docker' },
              { text: 'Raspberry Pi (native)', link: '/guide/raspberry-pi-native' },
              { text: 'Local development', link: '/guide/getting-started/local' },
            ],
          },
          {
            text: 'Hardware',
            collapsed: false,
            items: [
              { text: 'Brother QL labels', link: '/guide/hardware/printers' },
              { text: 'USB barcode scanner', link: '/guide/hardware/scanner' },
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
