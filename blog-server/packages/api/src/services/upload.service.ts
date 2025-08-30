// packages/api/src/services/upload.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

    // Return the public URL of the uploaded file
    return `https://${config.aws.bucketName}.s3.${config.aws.bucketRegion}.amazonaws.com/${fileKey}`;
  }
}
