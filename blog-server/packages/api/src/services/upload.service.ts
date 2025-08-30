// packages/api/src/services/upload.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const s3Client = new S3Client({
  region: config.aws.bucketRegion,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export class UploadService {
  /**
   * Uploads a file to S3 and returns the private file key.
   * Files are private by default.
   */
  public async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: config.aws.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return fileKey; // <-- Return the key, not a public URL
  }

  /**
   * Generates a temporary, pre-signed URL to access a private S3 object.
   */
  public async getPresignedUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: fileKey,
    });

    // The URL will be valid for 1 hour (3600 seconds)
    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  /**
   * Uploads a file publicly. Use this for assets that need a permanent, public URL,
   * like images embedded in Markdown content.
   */
  public async uploadPublicFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${uuidv4()}-${file.originalname}`;

    const params: PutObjectCommandInput = {
      Bucket: config.aws.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make this specific object public
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return `https://${config.aws.bucketName}.s3.${config.aws.bucketRegion}.amazonaws.com/${fileKey}`;
  }
  public async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.bucketName,
      Key: fileKey,
    });
    await s3Client.send(command);
  }
}
