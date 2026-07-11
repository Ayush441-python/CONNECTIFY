import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { uploadBuffer } from '../services/cloudinary.service';

/** POST /api/uploads/image — generic authenticated image upload, returns a Cloudinary URL */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');
  const folder = (req.query.folder as string) || 'misc';
  const { url } = await uploadBuffer(req.file.buffer, folder);
  sendSuccess(res, { url }, 'Image uploaded', 201);
});
