import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ApproveStatusDto {
  @ApiProperty({ required: true, type: String, format: 'date-time' })
  @IsNotEmpty()
  @IsDateString()
  pickup_schedule: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class RejectStatusDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CompleteRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
