import { inject } from 'inversify'
import { IImageService } from '../interfaces/IImageService'
import { CloudinaryConfig } from '../../config/cloudinary'
import { BadRequestError } from '../../utils/errors'
import { TYPES } from '../../config/types'

export class ImageService implements IImageService {
  constructor(
    @inject(TYPES.CloudinaryConfig)
    private readonly cloudinaryConfig: CloudinaryConfig
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new Error('No file provided')
      }

      const fileStr = Buffer.from(file.buffer).toString('base64')
      const fileUri = `data:${file.mimetype};base64,${fileStr}`

      //Upload image to cloudinary
      const cloudinary = this.cloudinaryConfig.getCloudinary()
      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: 'hr-management/profile-images',
        resource_type: 'image',
      })

      return uploadResponse.secure_url
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new BadRequestError('Error uploading image')
    }
  }
  async deleteImage(publicId: string): Promise<void> {
    try {
      if (!publicId) {
        throw new Error('No publicId provided')
      }

      const cloudinary = this.cloudinaryConfig.getCloudinary()
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new BadRequestError('Error deleting image')
    }
  }

  getPublicIdFromUrl(url: string): string | null {
    try {
      if (!url) return null

      // Parse the URL to extract the path
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')

      // Find the folder and filename parts after 'upload'
      const uploadIndex = pathParts.findIndex((part) => part === 'upload')
      if (uploadIndex === -1 || uploadIndex + 1 >= pathParts.length) return null

      // Extract the path after 'upload' excluding the version number (v1234567890)
      const relevantParts = pathParts
        .slice(uploadIndex + 1)
        .filter((part) => !part.startsWith('v'))

      // Join the parts to form the public ID
      // Remove the file extension from the last part
      const lastPart = relevantParts[relevantParts.length - 1]
      const lastPartWithoutExtension = lastPart.substring(
        0,
        lastPart.lastIndexOf('.')
      )
      relevantParts[relevantParts.length - 1] = lastPartWithoutExtension
      return relevantParts.join('/')
    } catch (error) {
      console.error('Error parsing URL:', error)
      return null
    }
  }
}
