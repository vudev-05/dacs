import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer =
    process.env.ANALYZE === "true"
        ? // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("@next/bundle-analyzer")({ enabled: true })
        : (config: NextConfig) => config;

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "framer-motion",
            "date-fns",
            "zod",
            "react-markdown",
            "remark-gfm",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
        ],
    },
    serverExternalPackages: [
        "@prisma/client",
        "prisma",
        "bcryptjs",
        "nodemailer",
        "stripe",
    ],
    images: {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        remotePatterns: [
            { protocol: "https", hostname: "**.googleusercontent.com" },
            { protocol: "https", hostname: "drive.google.com" },
            { protocol: "https", hostname: "flagcdn.com" },
            { protocol: "https", hostname: "likefood.app" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "img.vietqr.io" },
        ],
        localPatterns: [
            { pathname: "/uploads/**" },
            { pathname: "/api/uploads/**" },
            { pathname: "/images/**" },
            { pathname: "/categories/**" },
            { pathname: "/donggoi/**" },
            { pathname: "/sanpham/**" },
            { pathname: "/products/**" },
            { pathname: "/*.png" },
            { pathname: "/*.jpg" },
            { pathname: "/*.jpeg" },
            { pathname: "/*.webp" },
            { pathname: "/*.svg" },
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
    },
    poweredByHeader: false,
    reactStrictMode: true,
    // output: "standalone",
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob: https: http:",
                            "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com https://www.google-analytics.com https://api.openai.com https://*.upstash.io https://*.sentry.io",
                            "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/sanpham/:path*",
                destination: "/api/static/sanpham/:path*",
            },
            {
                source: "/api/uploads/:path*",
                destination: "/uploads/:path*",
            },
        ];
    },
};

const sentryConfig = {
    silent: !process.env.CI,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    hideSourceMaps: true,
    sourceMapsUploadOptions: {
        enabled: !!process.env.SENTRY_AUTH_TOKEN,
    },
};

const isDev = process.env.NODE_ENV !== "production";
export default isDev
    ? withBundleAnalyzer(nextConfig)
    : withSentryConfig(withBundleAnalyzer(nextConfig), sentryConfig);
