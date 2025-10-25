import { ApiProperty } from '@nestjs/swagger';

export class  ApproveStatusDto {
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  pickup_schedule: Date;

  @ApiProperty({ required: false })
  remark?: string;
}

export class  RejectStatusDto {
  @ApiProperty({ required: false })
  remark?: string;
}

