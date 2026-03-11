import { Injectable } from '@nestjs/common';
import { FilesRepository } from '@modules/files/files.repository';
import { StorageService } from '@infrastructure/storage/storage.service';
import { PresignFileDto } from '@modules/files/dto/presign-file.dto';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import {
  FileEntityType,
  FileStatus,
} from '@modules/files/constants/file-enums';
import {
  FileKind,
  VALID_FILE_KINDS,
} from '@modules/files/constants/file-kinds';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@common/exceptions/app.exception';
import { randomUUID } from 'crypto';
import { PresignResponseDto } from '@modules/files/dto/presign-response.dto';
import { CompleteFileDto } from '@modules/files/dto/complete-file.dto';
import { FileResponseDto } from '@modules/files/dto/file-response.dto';
import { FileRecord } from '@modules/files/entities/file-record.entity';
import { UserRole } from '@modules/users/entities/user.entity';
import { UPLOAD_PERMISSIONS } from '@modules/files/constants/file-upload-permissions';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly storageService: StorageService,
  ) {}

  async presign(
    presignFileDto: PresignFileDto,
    user: AccessTokenPayload,
  ): Promise<PresignResponseDto> {
    this.validateKindForEntity(presignFileDto.entityType, presignFileDto.kind);
    this.validateContentType(presignFileDto.contentType);
    this.validateUploadPermissions(presignFileDto.entityType, user.roles);
    const objectKey = this.buildObjectKey(
      presignFileDto.entityType,
      presignFileDto.kind,
      user.sub,
      presignFileDto.contentType,
    );
    const file = await this.filesRepository.create({
      ownerId: user.sub,
      entityType: presignFileDto.entityType,
      kind: presignFileDto.kind,
      objectKey,
      contentType: presignFileDto.contentType,
      sizeBytes: presignFileDto.sizeBytes,
      fileStatus: FileStatus.PENDING,
    });

    const { uploadUrl, expiresInSec } =
      await this.storageService.generatePresignedUploadUrl({
        key: file.objectKey,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
      });

    return {
      fileId: file.id,
      objectKey: file.objectKey,
      uploadUrl,
      uploadMethod: 'PUT',
      uploadHeaders: { 'Content-Type': file.contentType },
      expiresInSec,
    };
  }

  async complete(
    completeFileDto: CompleteFileDto,
    user: AccessTokenPayload,
  ): Promise<FileResponseDto> {
    const file = await this.filesRepository.findById(completeFileDto.fileId);
    if (!file) {
      throw new NotFoundException('File', completeFileDto.fileId);
    }
    if (file.ownerId !== user.sub) {
      throw new ForbiddenException('You do not have access to this file');
    }
    if (file.fileStatus === FileStatus.READY) {
      return this.toResponse(file);
    }

    const exist = await this.storageService.checkFileExists(file.objectKey);
    if (!exist) {
      throw new BadRequestException(
        'File has not been uploaded to storage yet',
      );
    }

    file.fileStatus = FileStatus.READY;
    file.completedAt = new Date();
    const savedFile = await this.filesRepository.save(file);
    return this.toResponse(savedFile);
  }

  async getReadyFileForAttach(
    fileId: string,
    ownerId: string,
  ): Promise<FileRecord> {
    const file = await this.filesRepository.findById(fileId);
    if (!file) {
      throw new NotFoundException('File not found', fileId);
    }
    if (file.ownerId !== ownerId) {
      throw new ForbiddenException('You can only attach your own files');
    }
    if (file.fileStatus !== FileStatus.READY) {
      throw new BadRequestException('File upload is not completed');
    }
    return file;
  }

  async attachToEntity(
    file: FileRecord,
    entityId: string,
  ): Promise<FileRecord> {
    file.entityId = entityId;
    return this.filesRepository.save(file);
  }

  async buildFileUrl(objectKey: string): Promise<string> {
    return await this.storageService.buildFileUrl(objectKey);
  }

  private validateKindForEntity(
    entityType: FileEntityType,
    kind: FileKind,
  ): void {
    const validKinds = VALID_FILE_KINDS[entityType];
    if (!validKinds.includes(kind)) {
      throw new BadRequestException(
        `Kind '${kind}' is not valid for entity type '${entityType}'. Allowed: ${validKinds?.join(', ')}`,
      );
    }
  }

  private validateContentType(contentType: string): void {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `Unsupported content type. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
      );
    }
  }

  private validateUploadPermissions(
    entityType: FileEntityType,
    userRoles: UserRole[],
  ): void {
    const allowedRoles = UPLOAD_PERMISSIONS[entityType];
    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      throw new ForbiddenException(
        `Your role does not allow uploading files for '${entityType}'`,
      );
    }
  }

  private buildObjectKey(
    entityType: FileEntityType,
    kind: FileKind,
    userId: string,
    contentType: string,
  ): string {
    const prefix = `${entityType}/${kind}/${userId}`;
    const ext = EXTENSION_MAP[contentType] ?? 'bin';
    return `${prefix}/${randomUUID()}.${ext}`;
  }

  private async toResponse(file: FileRecord): Promise<FileResponseDto> {
    return {
      id: file.id,
      ownerId: file.ownerId,
      entityType: file.entityType,
      entityId: file.entityId,
      kind: file.kind,
      status: file.fileStatus,
      visibility: file.visibility,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      url: await this.storageService.buildFileUrl(file.objectKey),
      completedAt: file.completedAt,
    };
  }
}
