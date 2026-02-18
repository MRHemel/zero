import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'High quality bluetooth headphones with noise cancellation' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 79.99, minimum: 0, description: 'Price in USD' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 100, minimum: 0, default: 0, description: 'Initial stock quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Category UUID' })
  @IsString()
  @IsUUID()
  categoryId: string;
}
