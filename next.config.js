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
  webpack(config, { isServer }) {
    if (isServer) {
      // Mark chrome-aws-lambda as an external dependency for the server-side bundle
      config.externals = [...config.externals, 'chrome-aws-lambda'];
    }
    return config;
  },
}
