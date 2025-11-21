import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDTO {
@ApiProperty()
  @IsString()
    @IsNotEmpty({ message: 'refresh_token is required' })
  refresh_token: string;
}
