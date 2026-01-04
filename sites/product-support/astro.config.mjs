import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: '勤怠管理システム',
      description: '勤怠管理システムの製品サポートサイト',
      defaultLocale: 'root',
      locales: {
        root: {
          label: '日本語',
          lang: 'ja',
        },
      },
      customCss: [
        './src/styles/custom.css',
      ],
      social: {
        github: 'https://github.com/goataka/attendance-kit',
      },
      sidebar: [
        {
          label: 'はじめに',
          items: [
            { label: '概要', link: '/' },
            { label: '使い方ガイド', link: '/getting-started/' },
          ],
        },
        {
          label: 'サポート',
          items: [
            { label: 'FAQ', link: '/faq/' },
          ],
        },
      ],
    }),
  ],
});
