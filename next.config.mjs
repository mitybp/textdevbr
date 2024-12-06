/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },{
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },{
        protocol: 'https',
        hostname: 'eu.ui-avatars.com',
        port: '',
        pathname: '/**'
      },{
        protocol: 'https',
        hostname: 'mitybp.github.io',
        port: '',
        pathname: '/**'
      }
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
