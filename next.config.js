/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Change from 'export' to 'standalone'
  images: {
    domains: ["images.unsplash.com"],
    unoptimized: true,
  },
};

module.exports = nextConfig;
