import multer from 'multer'
import { BadRequestError } from '../utils/errors'

// Store files in memory
const storage = multer.memoryStorage()

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new BadRequestError('Only image files are allowed'), false)
  }
}

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})
