import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MetaConvert',
    short_name: 'MetaConvert',
    description: 'Modern File Conversion & Transfer',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0B',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/favicon.png',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
