import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './branch.entity';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { IdResponseDto } from 'src/common/dto/id-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('branches')
@ApiBearerAuth('access-token') 
@UseGuards(AuthGuard('jwt-access'))
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully', type: IdResponseDto })
  async create(@Body() dto: CreateBranchDto): Promise<BaseResponse<IdResponseDto>> {
    const branch = await this.branchesService.create(dto);
    return BaseResponse.Success({ id: branch.id }, 'Branch created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 200, description: 'List of branches', type: Branch, isArray: true })
  async findAll(): Promise<BaseResponse<Branch[]>> {
    const branches = await this.branchesService.findAll();
    return BaseResponse.Success(branches, 'Branches retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by id' })
  @ApiResponse({ status: 200, description: 'Branch detail', type: Branch })
  async findOne(@Param('id') id: string): Promise<BaseResponse<Branch | null>> {
    const branch = await this.branchesService.findOne(id);
    if (!branch) {
      return BaseResponse.Fail('Branch not found');
    }
    return BaseResponse.Success(branch, 'Branch retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update branch' })
  @ApiResponse({ status: 200, description: 'Branch updated', type: IdResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto): Promise<BaseResponse<IdResponseDto>> {
    const branch = await this.branchesService.update(id, dto);
    return BaseResponse.Success({ id: branch.id }, 'Branch updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch' })
  @ApiResponse({ status: 200, description: 'Branch deleted', type: IdResponseDto })
  async remove(@Param('id') id: string): Promise<BaseResponse<IdResponseDto>> {
    await this.branchesService.remove(id);
    return BaseResponse.Success({ id }, 'Branch deleted successfully');
  }
}
