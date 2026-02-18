import { IsNotEmpty, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
