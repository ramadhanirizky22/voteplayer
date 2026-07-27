import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
  private s3Client: S3Client | null = null;
  private endpoint: string;
  private bucket: string;
  private region: string;
  private cdnUrl: string;
  private accessKeyId: string;
  private secretAccessKey: string;

  constructor() {
    this.endpoint = process.env.NEVACLOUD_STORAGE_ENDPOINT || 'https://s3.nevacloud.io';
    this.bucket = process.env.NEVACLOUD_STORAGE_BUCKET || 'voteplay-assets';
    this.region = process.env.NEVACLOUD_STORAGE_REGION || 'id-jkt-1';
    this.cdnUrl = process.env.NEVACLOUD_STORAGE_CDN_URL || 'https://cdn.nevacloud.io/esarizky';
    this.accessKeyId = process.env.NEVACLOUD_ACCESS_KEY_ID || '';
    this.secretAccessKey = process.env.NEVACLOUD_SECRET_ACCESS_KEY || '';

    if (this.accessKeyId && this.secretAccessKey) {
      this.s3Client = new S3Client({
        endpoint: this.endpoint,
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
        forcePathStyle: true, // Required for custom S3 compatible object storage like NevaCloud
      });
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, options: StorageUploadOptions): Promise<string> {
    const objectPath = `${options.folder}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

    if (this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectPath,
        Body: fileBuffer,
        ContentType: options.contentType,
        ACL: 'public-read',
      });
      await this.s3Client.send(command);
    }

    return `${this.cdnUrl}/${objectPath}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!fileUrl) return false;

    if (this.s3Client) {
      try {
        const objectKey = fileUrl.replace(`${this.cdnUrl}/`, '');
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
        });
        await this.s3Client.send(command);
        return true;
      } catch (err) {
        console.error('[NEVACLOUD_STORAGE_DELETE_ERROR]:', err);
        return false;
      }
    }
    return true;
  }

  async getPublicUrl(path: string): Promise<string> {
    return `${this.cdnUrl}/${path}`;
  }
}

export const storage = new NevaCloudStorageDriver();
