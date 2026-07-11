import cloudinary from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

interface UploadResult {
  url: string;
  publicId: string;
}

export function uploadBuffer(buffer: Buffer, folder: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `connectify/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          return reject(ApiError.internal(`Image upload failed: ${error?.message || 'unknown error'}`));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId).catch(() => undefined);
}
