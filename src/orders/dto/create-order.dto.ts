import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: '123 Main St, Dhaka, Bangladesh', description: 'Shipping address' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiPropertyOptional({ example: 'SUMMER20', description: 'Optional coupon code' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
