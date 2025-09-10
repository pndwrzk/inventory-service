import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
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
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        items: { type: 'array', items: { type: 'object' } }, 
        remarks: { type: 'string' },
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
}
