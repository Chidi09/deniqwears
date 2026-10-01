/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // The lookbook was retired until real campaign photography exists.
    return [
      { source: '/lookbook', destination: '/shop', permanent: false },
      // One address for search engines and customers: www goes to the main domain.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.deniqwears.com' }],
        destination: 'https://deniqwears.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
