/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["ipfs.infura.io", "ipfs.w3s.link"],
  },
};

module.exports = nextConfig;
