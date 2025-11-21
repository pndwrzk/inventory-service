import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../request-status-history/request-status.enum';

export class RequestItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  product_name: string;

  @ApiProperty()
  quantity: number;
}

export class AttachmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  file_path: string;
}

export class StatusHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: RequestStatus })
  status: RequestStatus;

  @ApiProperty({ required: false, nullable: true })
  remark: string | null;

@ApiProperty({ type: [AttachmentDto] })
  attachments: AttachmentDto[];

  @ApiProperty()
  action_by: string;

  @ApiProperty()
  created_at: Date;
}


export class RequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [RequestItemDto] })
  items: RequestItemDto[];
  @ApiProperty()
  pickup_schedule: Date | null;

  @ApiProperty()
  code: string;


  @ApiProperty({ type: [StatusHistoryDto] })
  status_histories: StatusHistoryDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

   @ApiProperty()
  current_status: string;
}

export class RequestResponseErrorItemDTO{
   @ApiProperty()
  product_id: string;

   @ApiProperty()
  product_name: string | null;

  @ApiProperty()
  details : string
 }
