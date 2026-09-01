import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paket native (Rust) di luar bundler: dimuat via require Node normal,
  // sehingga binding platform (linux / win32) ter-resolve dengan benar
  // meski node_modules dibagikan antar sistem operasi.
  serverExternalPackages: ["lightningcss", "@tailwindcss/oxide"],
};

export default nextConfig;
