import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../user-role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'username is required' })
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'full_name is required' })
  full_name: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole, { message: 'role must be branch, staff, or supervisor' })
  role: UserRole;

  @ApiProperty({ required: false, nullable: true })
  @ValidateIf((o) => o.role === UserRole.BRANCH)
  @IsUUID('4', { message: 'branch_id must be a valid UUID' })
  branch_id?: string;
}
