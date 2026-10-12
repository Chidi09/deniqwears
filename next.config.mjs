/** @type {import('next').NextConfig} */
// Headers that stop the browser from being talked into unsafe behaviour:
// no framing (clickjacking), no MIME guessing, no referrer leakage, and no
// camera/mic/location for the site. (A full Content-Security-Policy is a
// separate, riskier change because of Stripe and inline structured data.)
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
