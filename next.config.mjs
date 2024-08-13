/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns :[
            {
                protocol: 'https',
                hostname: 'workwaveblob1.blob.core.windows.net',
            }
        ]
    },
};

export default nextConfig;
