import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3Config, s3Config } from '@config/configuration';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface PresignOptions {
  key: string;
  contentType: string;
  sizeBytes: number;
  expiresInSec?: number;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly forcePathStyle: boolean;
  private readonly cloudfrontBaseUrl?: string;
  private readonly defaultPresignTtl: number;

  constructor(@Inject(s3Config.KEY) private readonly config: S3Config) {
    this.bucket = this.config.bucket;
    this.region = this.config.region;
    this.endpoint = this.config.endpoint;
    this.forcePathStyle = !!this.config.endpoint;
    this.cloudfrontBaseUrl = this.trimSlash(this.config.cloudfrontBaseUrl);
    this.defaultPresignTtl = this.config.defaultPresignTtl;

    this.client = new S3Client({
      region: this.region,
      forcePathStyle: this.forcePathStyle,
      ...(this.endpoint && { endpoint: this.endpoint }),
      ...(this.config.accessKeyId &&
        this.config.secretAccessKey && {
          credentials: {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey,
          },
        }),
    });
  }

  async generatePresignedUploadUrl(
    options: PresignOptions,
  ): Promise<{ uploadUrl: string; expiresInSec: number }> {
    const expiresInSec = options.expiresInSec ?? this.defaultPresignTtl;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ContentType: options.contentType,
      ContentLength: options.sizeBytes,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSec,
    });

    return { uploadUrl, expiresInSec };
  }

  async checkFileExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error: unknown) {
      const s3Error = error as { $metadata: { httpStatusCode?: number } };
      if (s3Error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  buildFileUrl(key: string): string {
    if (this.cloudfrontBaseUrl) {
      return `${this.cloudfrontBaseUrl}/${key}`;
    }

    if (this.endpoint) {
      const base = this.trimSlash(this.endpoint);
      return `${base}/${this.bucket}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getBucket(): string {
    return this.bucket;
  }

  private trimSlash(input?: string): string | undefined {
    return input?.replace(/\/+$/, '');
  }
}
