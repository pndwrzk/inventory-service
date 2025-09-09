import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Length } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001', description: 'Unique product SKU' })
  @IsString()
  @Length(1, 50)
  sku: string;

  @ApiProperty({ example: 'Tumbler Miniso', description: 'Product name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'Tumbler stainless steel ukuran 500ml', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 100, description: 'Stock quantity', required: false })
  @IsInt()
  @Min(0)
  stock: number;
}
