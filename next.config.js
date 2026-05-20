/** @type {import('next').NextConfig} */
module.exports = {
  turbopack: {
    root: __dirname
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindui.com'
      }
    ]
  }
};
