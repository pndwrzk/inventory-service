import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { JwtUser } from 'src/common/interface/jwt-user';
import { IdResponseDto } from 'src/common/dto/id-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { Request } from 'express';
import { RequestResponseDto } from './dto/request-response.dto';
import {
  ApproveStatusDto,
  CompleteRequestDto,
  RejectStatusDto,
} from './dto/update-status.dto';

@ApiTags('requests')
@Roles(UserRole.STAFF)
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt-access'))
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Request created successfully',
    type: IdResponseDto,
  })
  @ApiOperation({ summary: 'Create new request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              product_id: { type: 'string', example: 'SKU-001' },
              quantity: { type: 'integer', example: 5 },
            },
            required: ['product_id', 'quantity'],
          },
          example: [
            { product_id: 'SKU-001', quantity: 5 },
            { product_id: 'SKU-002', quantity: 3 },
          ],
        },
        remarks: {
          type: 'string',
          example: 'Urgent pickup request',
        },
      },
    },
  })
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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'jakarta',
  })
  @ApiOperation({
    summary: 'Get all requests with items, attachments, and status histories',
  })
  @ApiResponse({
    status: 200,
    description: 'List of requests',
    type: [RequestResponseDto],
  })
  async findAll(@Query('page') page = 1, @Query('size') size = 10, @Req() req: { user: JwtUser }, req2: Request) {
     const userId = req.user.userId;
    const pageNumber = Number(page);
    const pageSize = Number(size);
     const baseUrl = `${req2.protocol}://${req2.get('host')}`;
     console.log(baseUrl);
    const { data, meta } = await this.requestsService.findAll(
      pageNumber,
      pageSize,
      userId
    );
    return BaseResponse.Success(data, 'Requests retrieved successfully', {
      page: meta.page,
      size: meta.size,
      total_page: meta.totalPage,
    });
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a request' })
  @ApiResponse({
    status: 200,
    description: 'Request approved',
    type: IdResponseDto,
  })
  @ApiBody({ type: ApproveStatusDto })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveStatusDto,
    @Req() req: { user: JwtUser },
  ) {
    const request = await this.requestsService.approveRequest(
      id,
      req.user.userId,
      dto.pickup_schedule,
      dto.remark,
    );
    return BaseResponse.Success(
      { id: request.id },
      'Request approved successfully',
    );
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a request' })
  @ApiResponse({
    status: 200,
    description: 'Request rejected',
    type: IdResponseDto,
  })
  @ApiBody({ type: RejectStatusDto })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectStatusDto,
    @Req() req: { user: JwtUser },
  ) {
    const request = await this.requestsService.rejectRequest(
      id,
      req.user.userId,
      dto.remark,
    );
    return BaseResponse.Success(
      { id: request.id },
      'Request rejected successfully',
    );
  }

  @Patch(':id/complete')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiOperation({ summary: 'Complete a request' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Request completed',
    type: IdResponseDto,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        remarks: {
          type: 'string',
          example: 'Final submission',
        },
      },
    },
  })
  async complete(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: any,
    @Req() req: { user: JwtUser },
  ) {
    const request = await this.requestsService.completeRequest(
      id,
      req.user.userId,
      files,
      dto,
    );

    return BaseResponse.Success(
      { id: request.id },
      'Request completed successfully',
    );
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a request' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  async delete(@Param('id') id: string) {
    const result = await this.requestsService.deleteRequest(id);
    return BaseResponse.Success(
      { id: result.requestId },
      'Request deleted successfully',
    );
  }
}
