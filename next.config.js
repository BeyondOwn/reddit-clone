/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**', // Adjust the pattern according to your needs
      }],
    domains: ['uploadthing.com', 'lh3.googleusercontent.com',],
    
  },
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
