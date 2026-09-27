import type { NextConfig } from "next";

// PostHog is proxied through /ingest so tracker blockers don't drop events.
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const posthogAssetsHost = posthogHost?.replace(
  /\/\/(\w+)\.i\.posthog\.com/,
  "//$1-assets.i.posthog.com",
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    if (!posthogHost || !posthogAssetsHost) return [];
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
};

export default nextConfig;
