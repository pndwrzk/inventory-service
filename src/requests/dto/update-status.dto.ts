import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../request-status.enum';

export class UpdateStatusDto {
  @ApiProperty({ enum: RequestStatus, description: 'New status of the request' })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiProperty({ description: 'Optional remark for status change', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
