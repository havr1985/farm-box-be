import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { User } from '@modules/users/entities/user.entity';
import { AttachFileDto } from '@modules/files/dto/attach-file.dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Post('avatar')
  async setAvatar(
    @Body() dto: AttachFileDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.usersService.setAvatar(dto.fileId, userId);
  }
}
