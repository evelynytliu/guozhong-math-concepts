/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 本地優先：AI 環節用 Agent SDK，需把它標記為外部套件，避免被打包進前端
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/claude-agent-sdk"],
  },
};

export default nextConfig;
