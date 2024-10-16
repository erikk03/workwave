/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns :[
            {
                protocol: 'https',
                hostname: 'workwaveblob1.blob.core.windows.net',
            },
            {
                protocol: 'https',
                hostname: 'workwaveblob.blob.core.windows.net', // Updated hostname
            },
        ]
    },
};

export default nextConfig;
