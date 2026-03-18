import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class MediaService {
  private r2: S3Client;

  constructor() {
    this.r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async upload(tenantId: string, module: string, entityId: string, file: Express.Multer.File) {
    const key = `${tenantId}/${module}/${entityId}/${file.originalname}`;
    
    await this.r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'waterting-assets',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return { url: publicUrl, key };
  }
}
