/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lottie.host', 'media.istockphoto.com', 'upload.wikimedia.org'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig