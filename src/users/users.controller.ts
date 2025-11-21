import { Controller, Post, Body, HttpCode, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IdResponseDto } from 'src/common/dto/id-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenDTO } from './dto/refresh-token-request';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('auth')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: IdResponseDto,
  })
  async register(
    @Body() body: CreateUserDto,
  ): Promise<BaseResponse<IdResponseDto>> {
    const user = await this.usersService.create(body);
    return BaseResponse.Success(user, 'User registered successfully');
  }


  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user and get tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  async login(
    @Body() body: LoginRequestDto,
  ): Promise<BaseResponse<LoginResponseDto>> {
    const loginData = await this.usersService.login(
      body.username,
      body.password,
    );
    return BaseResponse.Success(loginData, 'Login successful');
  }


  @Get('users')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt-access'))
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserListResponseDto],
  })
  async getAll(): Promise<BaseResponse<UserListResponseDto[]>> {
    const users = await this.usersService.getAll();
    return BaseResponse.Success(users, 'Fetched all users successfully');
  }

  @Post('refresh')
@HttpCode(200)
@ApiOperation({ summary: 'Refresh access token' })
@ApiResponse({
  status: 200,
  description: 'Token refreshed successfully',
  type: TokenResponseDto,
})
async refresh(
  @Body() body: RefreshTokenDTO,
): Promise<BaseResponse<TokenResponseDto>> {
  const data = await this.usersService.refreshToken(body.refresh_token);
  return BaseResponse.Success(data, 'Token refreshed successfully');
}

}


