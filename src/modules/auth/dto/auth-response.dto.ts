import { UserRole } from '@modules/users/entities/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

export class AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
