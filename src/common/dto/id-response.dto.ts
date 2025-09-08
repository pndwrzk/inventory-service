import { ApiProperty } from '@nestjs/swagger';

export class IdResponseDto {
  @ApiProperty({ example: 'a3e0b9c1-7f7a-4f6e-9d6a-123456789abc' })
  id: string;
}
