/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns :[
            {
                protocol: 'https',
                hostname: 'linkedinsdi2100043.blob.core.windows.net',
            }
        ]
    },
};

export default nextConfig;
