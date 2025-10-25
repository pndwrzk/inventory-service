import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './products.entity';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { IdResponseDto } from 'src/common/dto/id-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('products')
// @ApiBearerAuth('access-token')
// @UseGuards(AuthGuard('jwt-access'))
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: IdResponseDto })
  async create(@Body() dto: CreateProductDto): Promise<BaseResponse<IdResponseDto>> {
    const product = await this.productsService.create(dto);
    return BaseResponse.Success({ id: product.id }, 'Product created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products', type: Product, isArray: true })
  async findAll(): Promise<BaseResponse<Product[]>> {
    const products = await this.productsService.findAll();
    return BaseResponse.Success(products, 'Products retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 200, description: 'Product detail', type: Product })
  async findOne(@Param('id') id: string): Promise<BaseResponse<Product | null>> {
    const product = await this.productsService.findOne(id);
    return BaseResponse.Success(product, 'Product retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated', type: IdResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<BaseResponse<IdResponseDto>> {
    const product = await this.productsService.update(id, dto);
    return BaseResponse.Success({ id: product.id }, 'Product updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted', type: IdResponseDto })
  async remove(@Param('id') id: string): Promise<BaseResponse<IdResponseDto>> {
    await this.productsService.remove(id);
    return BaseResponse.Success({ id }, 'Product deleted successfully');
  }
}
