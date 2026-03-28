/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"]
};

export default nextConfig;
