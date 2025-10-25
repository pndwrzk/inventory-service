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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { JwtUser } from 'src/common/interface/jwt-user';
import { IdResponseDto } from 'src/common/dto/id-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { RequestResponseDto } from './dto/request-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

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
  @ApiResponse({ status: 201, description: 'Request created successfully', type: IdResponseDto })
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
  @ApiOperation({ summary: 'Get all requests with items, attachments, and status histories' })
  @ApiResponse({ status: 200, description: 'List of requests', type: [RequestResponseDto] })
  async findAll() {
    const requests = await this.requestsService.findAll();
    return BaseResponse.Success(requests, 'Requests retrieved successfully');
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status of a request' })
  @ApiResponse({ status: 200, description: 'Request status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: { user: JwtUser },
  ) {
    const userId = req.user.userId;


    const updatedRequest = await this.requestsService.updateStatus(
      id,
      dto.status,
      userId,
      dto.remark,
    );

    return BaseResponse.Success(
      { id: updatedRequest.id },
      'Request status updated successfully',
    );
  }
}


