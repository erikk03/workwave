const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
import imageCompression from 'browser-image-compression';

async function compressImage(file) {
    const options = {
        maxSizeMB: 1, // Maximum file size (MB)
        maxWidthOrHeight: 1920, // Max width or height to keep aspect ratio
        useWebWorker: true // Use multi-threading for faster compression
    };

    try {
        const compressedFile = await imageCompression(file, options);
        console.log('Original file size:', file.size / 1024 / 1024, 'MB');
        console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
        return compressedFile;
    } catch (error) {
        console.error('Error during image compression:', error);
    }
}

async function compressVideo(file) {
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
    
    await ffmpeg.run('-i', 'input.mp4', '-vcodec', 'libx264', '-crf', '28', 'output.mp4');
    
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const compressedFile = new Blob([data.buffer], { type: 'video/mp4' });
    
    console.log('Original file size:', file.size / 1024 / 1024, 'MB');
    console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
    
    return compressedFile;
}

module.exports = { compressImage, compressVideo };