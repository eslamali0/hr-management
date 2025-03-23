export interface IImageService {
  uploadImage(file: Express.Multer.File): Promise<string>
  deleteImage(publicId: string): Promise<void>
  getPublicIdFromUrl(url: string): string | null
}
