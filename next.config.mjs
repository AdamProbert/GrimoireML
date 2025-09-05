/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cards.scryfall.io' }
    ]
  }
};

export default nextConfig;
