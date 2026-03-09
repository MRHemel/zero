import { IsNotEmpty, IsString, IsUUID, IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSize } from '@prisma/client';

export class AddToCartDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Product UUID' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1, description: 'Quantity to add' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ enum: ProductSize, example: 'M', description: 'Product size (S, M, L, XL)' })
  @IsEnum(ProductSize)
  @IsNotEmpty()
  size: ProductSize;

  @ApiPropertyOptional({ example: 'Gift wrap please', description: 'Optional custom requirement' })
  @IsOptional()
  @IsString()
  customRequirement?: string;
}
