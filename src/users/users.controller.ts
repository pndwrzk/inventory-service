import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IdResponseDto } from 'src/common/dto/id-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: IdResponseDto })
  async register(@Body() body: CreateUserDto): Promise<BaseResponse<IdResponseDto>> {
    const user = await this.usersService.create(body);

    return BaseResponse.Success(user, 'User registered successfully');
  }
}
