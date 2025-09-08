import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
@ApiProperty()
  @IsString()
    @IsNotEmpty({ message: 'username is required' })
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}
