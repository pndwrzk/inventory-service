import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class CreateRequestItemDto {
  @ApiProperty({ format: 'uuid', description: 'Product ID (UUID)' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 5, description: 'Jumlah item yang diminta (min 1)' })
  @IsInt()
  @Min(1)
  quantity: number;
}
export class CreateRequestDto {
  @ApiProperty({
    type: [CreateRequestItemDto],
    description: 'Daftar item yang akan direquest',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestItemDto)
  @Transform(({ value }) => {
    // Jika value berupa string, parse JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new BadRequestException('Items harus berupa array');
        }
        return parsed;
      } catch {
        throw new BadRequestException('Items JSON invalid');
      }
    }
    // Kalau bukan string, pastikan tetap array
    if (!Array.isArray(value)) {
      throw new BadRequestException('Items harus berupa array');
    }
    return value;
  })
  items: CreateRequestItemDto[];

  @ApiPropertyOptional({
    example: 'Perlu diproses cepat',
    description: 'Catatan tambahan atau remark',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}