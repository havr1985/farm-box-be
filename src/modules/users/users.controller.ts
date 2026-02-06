import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { User } from '@modules/users/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }
}
