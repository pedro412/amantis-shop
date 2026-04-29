import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === '1',
});

// R2 public bucket host. We pass `unoptimized` on every R2 <Image> so the
// Vercel optimizer is bypassed — R2 already serves pre-baked webp variants
// (thumb/medium/full) generated at upload time. The remotePatterns entry is
// still required for `next/image` to accept the URL at build/runtime.
const r2PublicUrl =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL ?? '';

const r2RemotePatterns = (() => {
  if (!r2PublicUrl) return [];
  try {
    const url = new URL(r2PublicUrl);
    return [
      {
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        pathname: '/**',
      },
    ];
  } catch {
    return [];
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: r2RemotePatterns,
  },
};

export default withBundleAnalyzer(nextConfig);
