import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure from environment
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - File buffer from multer memory storage
 * @param folder - Cloudinary folder name (e.g. 'raffle-items')
 * @returns Cloudinary secure URL
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string = 'raffle-items'
): Promise<string> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' }, // Max dimensions
                    { quality: 'auto', fetch_format: 'auto' },   // Optimize
                ],
            },
            (error, result: UploadApiResponse | undefined) => {
                if (error) {
                    console.error('[Cloudinary] Upload error:', error.message);
                    return reject(new Error('Image upload failed'));
                }
                if (!result) {
                    return reject(new Error('No result from Cloudinary'));
                }
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}

/**
 * Delete an image from Cloudinary by URL
 * @param url - Cloudinary URL
 */
export async function deleteFromCloudinary(url: string): Promise<void> {
    try {
        // Extract public_id from URL
        const parts = url.split('/');
        const folderAndFile = parts.slice(-2).join('/');
        const publicId = folderAndFile.replace(/\.[^.]+$/, ''); // Remove extension
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('[Cloudinary] Delete error:', error);
    }
}

export default cloudinary;
