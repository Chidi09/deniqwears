import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Deniqwears',
    short_name: 'Deniqwears',
    description: 'Womenswear in sizes 10 to 20. Statement sets, dresses and occasion pieces.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F1EB',
    theme_color: '#1E2656',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
