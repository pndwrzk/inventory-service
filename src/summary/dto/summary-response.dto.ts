import { ApiProperty } from "@nestjs/swagger";

export class ResponseSummaryDTO {
  @ApiProperty()
  total_branches: number;

  @ApiProperty()
  total_users: number;

  @ApiProperty()
  total_requests: number;

  @ApiProperty()
  total_products: number;

}