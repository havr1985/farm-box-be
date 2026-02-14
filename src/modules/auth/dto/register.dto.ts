import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Олена Покупець' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'olena@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description:
      'Min 8 chars, at least one uppercase, one digit, one special character',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
    message:
      'Password must contain at least one uppercase letter, one digit, and one special character',
  })
  password: string;

  @ApiProperty({ example: '+380501234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone: string;
}
