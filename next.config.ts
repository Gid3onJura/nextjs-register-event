import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // output: "standalone",
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })
    return config
  },
  env: {
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
  // Enable production source maps to get readable stack traces for minified errors.
  // productionBrowserSourceMaps: true,
  // Disable Turbopack on environments without native bindings.
  turbopack: {},
}

export default nextConfig
