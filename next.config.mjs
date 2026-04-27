/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma's custom output path (server/lib/generated/prisma) isn't picked up
  // by Next's default file tracing on Vercel, so the rhel-openssl-3.0.x query
  // engine .so file ships missing. Force it into the lambda bundle.
  outputFileTracingIncludes: {
    '/**/*': ['./server/lib/generated/prisma/**/*'],
  },
};

export default nextConfig;
