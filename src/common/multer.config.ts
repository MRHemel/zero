import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

export const multerProductOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (_req, file, cb) => {
      // Generate a unique filename: <uuid><original-ext>
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(
        new BadRequestException(`Unsupported file type. Allowed: ${allowed.join(', ')}`),
        false,
      );
    }
    cb(null, true);
  },
};
