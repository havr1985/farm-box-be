import { UserRole } from '@modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Олена Покупець' })
  name: string;

  @ApiProperty({ example: 'olena@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, isArray: true, example: ['customer'] })
  roles: UserRole[];
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
