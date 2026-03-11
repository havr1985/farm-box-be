import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { FilesService } from '@modules/files/files.service';
import { PresignFileDto } from '@modules/files/dto/presign-file.dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { PresignResponseDto } from '@modules/files/dto/presign-response.dto';
import { CompleteFileDto } from '@modules/files/dto/complete-file.dto';
import { FileResponseDto } from '@modules/files/dto/file-response.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Get presigned URL for file upload' })
  @ApiResponse({ status: 201, description: 'Presigned URL generated' })
  @ApiResponse({ status: 400, description: 'Invalid content type or kind' })
  async presign(
    @Body() dto: PresignFileDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<PresignResponseDto> {
    return this.filesService.presign(dto, user);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm file upload completion' })
  @ApiResponse({ status: 200, description: 'File marked as ready' })
  @ApiResponse({ status: 400, description: 'File not found in storage' })
  @ApiResponse({ status: 403, description: 'Not file owner' })
  async complete(
    @Body() dto: CompleteFileDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<FileResponseDto> {
    return this.filesService.complete(dto, user);
  }
}
