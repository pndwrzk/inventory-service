import { Controller, Post, Get, Body, UploadedFiles, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { JwtUser } from 'src/common/interface/jwt-user';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { RequestResponseDto } from './dto/request-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { IdResponseDto } from 'src/common/dto/id-response.dto';

@ApiTags('requests')
@Roles(UserRole.STAFF)
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt-access'))
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // ---------------- CREATE ----------------
  @Post()
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Request created successfully', type: IdResponseDto })
  @ApiOperation({ summary: 'Create new request' })
  async create(
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: { user: JwtUser },
  ) {
    const userId = req.user.userId;
    const request = await this.requestsService.create(dto, files, userId);
    return BaseResponse.Success(
      { id: request.id },
      'Request created successfully',
    );
  }


  @Get()
  @ApiOperation({ summary: 'Get all requests with items, attachments, and status histories' })
  @ApiResponse({ status: 200, description: 'List of requests', type: [RequestResponseDto] })
  async findAll() {
    const requests = await this.requestsService.findAll();
    return BaseResponse.Success(requests, 'Requests retrieved successfully');
  }
}
