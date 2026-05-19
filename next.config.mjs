/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      // Old static-site URLs → clean App Router routes
      { source: '/index.html',   destination: '/',         permanent: true },
      { source: '/pricing.html', destination: '/pricing',  permanent: true },
      { source: '/start.html',   destination: '/start',    permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Keep the old endpoint path working from any cached front-end
      { source: '/create-checkout-session', destination: '/api/create-checkout-session' },
    ];
  },
};

export default nextConfig;
