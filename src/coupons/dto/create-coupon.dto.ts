import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER20', description: 'Unique coupon code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 50, minimum: 0, description: 'Discount amount' })
  @IsNumber()
  @Min(0)
  discountAmount: number;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'Expiry date (ISO 8601)' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
