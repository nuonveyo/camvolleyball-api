import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RpcException } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileServiceService implements OnModuleInit {
  private readonly logger = new Logger(FileServiceService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'camvolleyball-uploads';

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'admin',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'password123',
      },
      endpoint: this.configService.get<string>('AWS_S3_ENDPOINT') || 'http://localhost:9000',
      forcePathStyle: true, // Needed for MinIO
    });
  }

  async onModuleInit() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Bucket '${this.bucketName}' exists.`);
    } catch {
      this.logger.log(`Bucket '${this.bucketName}' not found. Creating...`);
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        this.logger.log(`Bucket '${this.bucketName}' created successfully.`);
      } catch (err) {
        this.logger.error(`Failed to create bucket: ${err.message}`);
      }
    }

    // Apply Public Read Policy
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    try {
      await this.s3Client.send(new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(policy),
      }));
      this.logger.log(`Public read policy applied to bucket '${this.bucketName}'.`);
    } catch (err) {
      this.logger.error(`Failed to apply bucket policy: ${err.message}`);
    }
  }

  async getPresignedUrl(fileName: string, fileType: string) {
    // 1. Validate MIME type
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm'
    ];

    if (!allowedMimeTypes.includes(fileType)) {
      throw new RpcException('Invalid file type. Only images and videos are allowed.');
    }

    // 2. Generate unique key
    const extension = fileName.split('.').pop();
    const uniqueKey = `${uuidv4()}.${extension}`;

    // 3. Generate presigned URL
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      // Determine public URL (for frontend to access later)
      // Use the Public Endpoint for the browser to reach MinIO
      const publicEndpoint = this.configService.get<string>('AWS_S3_PUBLIC_ENDPOINT') || 'http://localhost:9000';
      const publicUrl = `${publicEndpoint}/${this.bucketName}/${uniqueKey}`;

      return {
        uploadUrl,
        key: uniqueKey,
        publicUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw new RpcException('Failed to generate upload URL');
    }
  }
}
