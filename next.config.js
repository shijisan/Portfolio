// next.config.js

module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vercel.com',
        pathname: '/**/*.jpg', // Assuming the image you're fetching ends with .jpg
      },
    ],
  },
}
