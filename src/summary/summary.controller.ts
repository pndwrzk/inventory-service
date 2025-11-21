import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SummaryService } from './summary.service';
import { ResponseSummaryDTO } from './dto/summary-response.dto';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('summary')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt-access'))
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @ApiOperation({ summary: 'Get system summary' })
  @ApiResponse({
    status: 200,
    description: 'Summary data retrieved successfully',
    type: ResponseSummaryDTO,
  })
  async getSummary(): Promise<BaseResponse<ResponseSummaryDTO>> {
    const summary = await this.summaryService.getSummary();
    return BaseResponse.Success(summary, 'Summary retrieved successfully');
  }
}
