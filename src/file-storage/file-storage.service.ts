/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/file-storage/file-storage.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';

export interface FileUploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  path: string;
}

@Injectable()
export class FileStorageService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get<string>(
      'BASE_URL',
      'http://localhost:3000',
    );

    // Ensure upload directories exist
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    const directories = [
      path.join(this.uploadDir, 'products'),
      path.join(this.uploadDir, 'products', 'thumbnails'),
      path.join(this.uploadDir, 'temp'),
    ];

    directories.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<FileUploadResult> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Validate file type
      if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;

      const uploadPath = path.join(this.uploadDir, folder);
      const filePath = path.join(uploadPath, uniqueFilename);
      const thumbnailPath = path.join(
        uploadPath,
        'thumbnails',
        `thumb_${uniqueFilename}`,
      );

      // Ensure directory exists
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      if (!existsSync(path.join(uploadPath, 'thumbnails'))) {
        mkdirSync(path.join(uploadPath, 'thumbnails'), { recursive: true });
      }

      // Process and save the main image
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await sharp(file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(filePath);

      // Create thumbnail
      await sharp(file.buffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      const result: FileUploadResult = {
        filename: uniqueFilename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `${this.baseUrl}/uploads/${folder}/${uniqueFilename}`,
        thumbnailUrl: `${this.baseUrl}/uploads/${folder}/thumbnails/thumb_${uniqueFilename}`,
        path: filePath,
      };

      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'products',
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(
    filename: string,
    folder: string = 'products',
  ): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, folder, filename);
      const thumbnailPath = path.join(
        this.uploadDir,
        folder,
        'thumbnails',
        `thumb_${filename}`,
      );

      // Delete main image
      try {
        await fs.unlink(filePath);
      } catch {
        console.warn(`Could not delete main image: ${filePath}`);
      }

      // Delete thumbnail
      try {
        await fs.unlink(thumbnailPath);
      } catch {
        console.warn(`Could not delete thumbnail: ${thumbnailPath}`);
      }

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  async deleteMultipleImages(
    filenames: string[],
    folder: string = 'products',
  ): Promise<boolean[]> {
    const deletePromises = filenames.map((filename) =>
      this.deleteImage(filename, folder),
    );
    return Promise.all(deletePromises);
  }

  // Extract filename from URL for deletion
  extractFilename(imageUrl: string): string | null {
    try {
      const urlParts = imageUrl.split('/');
      return urlParts[urlParts.length - 1] || null;
    } catch (error) {
      console.error('Error extracting filename:', error);
      return null;
    }
  }

  // Get file info
  async getFileInfo(
    filename: string,
    folder: string = 'products',
  ): Promise<FileUploadResult | null> {
    try {
      const filePath = path.join(this.uploadDir, folder, filename);
      const stats = await fs.stat(filePath);

      return {
        filename,
        originalName: filename,
        mimetype: 'image/jpeg', // Default, you might want to store this info
        size: stats.size,
        url: `${this.baseUrl}/uploads/${folder}/${filename}`,
        thumbnailUrl: `${this.baseUrl}/uploads/${folder}/thumbnails/thumb_${filename}`,
        path: filePath,
      };
    } catch {
      return null;
    }
  }

  // Clean up orphaned files (files not referenced in database)
  async cleanupOrphanedFiles(
    referencedFiles: string[],
    folder: string = 'products',
  ): Promise<number> {
    try {
      const uploadPath = path.join(this.uploadDir, folder);
      const files = await fs.readdir(uploadPath);

      let deletedCount = 0;
      for (const file of files) {
        if (file !== 'thumbnails' && !referencedFiles.includes(file)) {
          await this.deleteImage(file, folder);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    folders: { [key: string]: { files: number; size: number } };
  }> {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        folders: {} as { [key: string]: { files: number; size: number } },
      };

      const uploadPath = this.uploadDir;
      const folders = await fs.readdir(uploadPath);

      for (const folder of folders) {
        const folderPath = path.join(uploadPath, folder);
        const folderStats = await fs.stat(folderPath);

        if (folderStats.isDirectory()) {
          const files = await fs.readdir(folderPath);
          let folderSize = 0;
          let fileCount = 0;

          for (const file of files) {
            if (file !== 'thumbnails') {
              const filePath = path.join(folderPath, file);
              const fileStats = await fs.stat(filePath);
              if (fileStats.isFile()) {
                folderSize += fileStats.size;
                fileCount++;
              }
            }
          }

          stats.folders[folder] = { files: fileCount, size: folderSize };
          stats.totalFiles += fileCount;
          stats.totalSize += folderSize;
        }
      }

      return stats;
    } catch (error) {
      console.error('Stats error:', error);
      return { totalFiles: 0, totalSize: 0, folders: {} };
    }
  }
}
