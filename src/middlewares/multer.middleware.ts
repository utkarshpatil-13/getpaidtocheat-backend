import multer from 'multer'
import { Context, Next } from 'hono';

const storage = multer.memoryStorage(); // Store file in memory, not disk

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB file limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

export const videoUploadMiddleware = upload.single('video');

// Extend Hono's Context request object to include Multer's `file`
declare module 'hono' {
  interface HonoRequest {
    file?: Express.Multer.File;
  }
}
