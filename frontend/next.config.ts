import type { NextConfig } from "next";

const repoBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || "").trim();

function normalizeBasePath(input: string): string {
  if (!input) return "";
  const withLeading = input.startsWith("/") ? input : `/${input}`;
  return withLeading.replace(/\/+$/, "");
}

const normalizedBasePath = normalizeBasePath(repoBasePath);

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_FRIENDCIRCLE_ADDRESS: "",
    NEXT_PUBLIC_BASE_PATH: normalizedBasePath,
  },
  ...(normalizedBasePath
    ? { basePath: normalizedBasePath, assetPrefix: `${normalizedBasePath}/` }
    : {}),
};

export default nextConfig;


