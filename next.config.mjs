/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // The lookbook was retired until real campaign photography exists.
    return [{ source: '/lookbook', destination: '/shop', permanent: false }];
  },
};

export default nextConfig;
