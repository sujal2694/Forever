/** @type {import('next').NextConfig} */
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.slice(0, -1),
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;