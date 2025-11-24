import { ApiProperty } from '@nestjs/swagger';

export class CountRequestResponseDto {
  @ApiProperty({ type: Number, example: 5 })
  total_pending: number;

  @ApiProperty({ type: Number, example: 10 })
  total_approved: number;

  @ApiProperty({ type: Number, example: 3 })
  total_rejected: number;

  @ApiProperty({ type: Number, example: 8 })
  total_completed: number;
}
