import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category UUID' })
  @IsOptional()
  @IsString()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Search in name & description' })
  @IsOptional()
  @IsString()
  search?: string;
}
