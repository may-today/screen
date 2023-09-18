import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

import { presetUno, presetIcons } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'
import AstroPWA from '@vite-pwa/astro'
import solid from '@astrojs/solid-js'

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
  },
  integrations: [
    solid(),
    UnoCSS({
      presets: [
        presetUno({
          dark: 'class',
        }),
        presetIcons(),
      ],
      transformers: [
        transformerDirectives(),
      ],
      shortcuts: [{
        'bg-base': 'bg-light-50 dark:bg-[#0A0A0A]',
        'bg-base-100': 'bg-light-400 dark:bg-dark-400',
        'bg-base-200': 'bg-light-600 dark:bg-dark-500',
        'fg-base': 'text-neutral-700 dark:text-neutral-300',
        'fg-lighter': 'text-neutral-400 dark:text-neutral-500',
        'fg-lighter-200': 'text-neutral-400/50 dark:text-neutral-500/50',
        'fg-emphasis': 'text-dark-900 dark:text-light-900',
        'fg-primary': 'text-sky-700 dark:text-sky-300',
        'bg-primary': 'bg-sky-500/10 dark:bg-sky-300/10',
        'hv-base': 'transition-colors duration-300 cursor-pointer hover:bg-base-100',
        'border-base': 'border-light-900 dark:border-dark-200',
        'bg-blur': 'bg-light-50/85 dark:bg-dark-800/85 backdrop-blur-xl backdrop-saturate-150',
        'fcc': 'flex items-center justify-center',
        'button': 'bg-base-100 hv-base hover:bg-base-100',
        'button-highlight': 'fg-primary bg-primary hover:bg-primary! hover:fg-primary!',
        'button-icon': 'button fcc rounded-md w-8 h-8',
        'badge': 'fcc text-xs rounded bg-base-200 text-dark/40 dark:text-light/50',
      }],
    }),
    AstroPWA({
      base: '/',
      scope: '/',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      registerType: 'autoUpdate',
      manifest: {
        name: 'Teleprompter',
        short_name: 'MayScreen',
        description: 'MayScreen',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        workbox: {
          navigateFallback: '/404',
          globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
        },
        devOptions: {
          enabled: true,
          navigateFallbackAllowlist: [/^\/404$/],
        },
      },
    }),
  ],
})
