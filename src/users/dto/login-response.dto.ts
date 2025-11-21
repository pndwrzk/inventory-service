import { UserResponseDto } from './user-response.dto';
import { TokenResponseDto } from './token-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserBranchResponseDto } from './user-branch-response.dto';

export class LoginResponseDto {
    @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;
  @ApiProperty({ type: () => TokenResponseDto })
  tokens: TokenResponseDto;
}
