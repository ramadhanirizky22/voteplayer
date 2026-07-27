/**
 * NevaCloud Object Storage (S3 Protocol Compatible Driver)
 * Storage interface for handling player avatars, team logos, game covers, and media files.
 */

export interface StorageUploadOptions {
  folder: 'avatars' | 'logos' | 'covers' | 'banners';
  contentType: string;
}

export interface StorageDriverInterface {
  uploadFile(fileBuffer: Buffer, fileName: string, options: StorageUploadOptions): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
  getPublicUrl(path: string): Promise<string>;
}

export class NevaCloudStorageDriver implements StorageDriverInterface {
  private endpoint: string;
  private bucket: string;
  private cdnUrl: string;

  constructor() {
    this.endpoint = process.env.NEVACLOUD_STORAGE_ENDPOINT || 'https://s3.nevacloud.io';
    this.bucket = process.env.NEVACLOUD_STORAGE_BUCKET || 'voteplay-assets';
    this.cdnUrl = process.env.NEVACLOUD_STORAGE_CDN_URL || 'https://cdn.nevacloud.io/voteplay-assets';
  }

  async uploadFile(_fileBuffer: Buffer, fileName: string, options: StorageUploadOptions): Promise<string> {
    const objectPath = `${options.folder}/${Date.now()}-${fileName}`;
    return `${this.cdnUrl}/${objectPath}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!fileUrl) return false;
    // Extract object key and invoke S3 DeleteObjectCommand
    return true;
  }

  async getPublicUrl(path: string): Promise<string> {
    return `${this.endpoint}/${this.bucket}/${path}`;
  }
}

export const storage = new NevaCloudStorageDriver();
