import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';
import { UserBranchResponseDto } from './user-branch-response.dto';

export class UserListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: () => UserBranchResponseDto, nullable: true })
  branch: UserBranchResponseDto | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
