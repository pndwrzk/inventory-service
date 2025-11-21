
import { ApiProperty } from '@nestjs/swagger';
import { UserBranchResponseDto } from './user-branch-response.dto';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty()
  role: string;
  
@ApiProperty()
   branch : UserBranchResponseDto | null

}
