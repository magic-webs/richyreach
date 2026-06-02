import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins: ['192.168.1.36'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'api.dicebear.com',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
