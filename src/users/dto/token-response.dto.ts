import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  access_token_expired: number;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  refresh_token_expired: number;
}
