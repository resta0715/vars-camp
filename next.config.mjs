/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "profile.line-scdn.net",
      },
    ],
  },
  webpack: (config) => {
    // Zoom Meeting SDK が参照する未公開/任意モジュールを空モジュールに解決
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@zoom/download-manager": false,
    };
    return config;
  },
};

export default nextConfig;
