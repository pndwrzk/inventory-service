import { ApiProperty } from '@nestjs/swagger';

export class UserBranchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
