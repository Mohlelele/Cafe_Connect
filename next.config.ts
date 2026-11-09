import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  async redirects() {
    return [{ source: '/customer-view', destination: '/admin/orders', permanent: true }];
  },
};

export default nextConfig;
