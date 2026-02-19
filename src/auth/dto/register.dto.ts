import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: '+880',
    description: 'Country calling code, e.g. "+880" for Bangladesh, "+1" for USA',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,4}$/, { message: 'countryCode must be in format +880 or +1' })
  countryCode?: string;

  @ApiPropertyOptional({ example: '1712345678', description: 'Phone number without country code' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.countryCode)
  @IsNotEmpty({ message: 'phone is required when countryCode is provided' })
  phone?: string;

  @ApiProperty({ example: 'strongP@ss1', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
