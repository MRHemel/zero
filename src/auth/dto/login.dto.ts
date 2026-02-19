import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'john@example.com  OR  +8801712345678',
    description: 'Email address or full phone number with country code (e.g. +8801712345678)',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'strongP@ss1', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
