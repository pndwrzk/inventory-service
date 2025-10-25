import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepo.findOne({
      where: { sku: dto.sku },
    });
    if (existing) {
      throw new Error(`SKU "${dto.sku}" already exists`);
    }
    const product = this.productRepo.create(dto);
    return await this.productRepo.save(product);
  }

async findAll(
  page: number,
  size: number,
  search?: string,
): Promise<{ data: Product[]; meta: { total: number; page: number; size: number; totalPage: number } }> {
  const skip = (page - 1) * size;
  const where = search
    ? [
        { name: ILike(`%${search}%`) },
        { sku: ILike(`%${search}%`) }
      ]
    : {};

  const [data, total] = await this.productRepo.findAndCount({
    where,
    skip,
    take: size,
    order: { created_at: 'DESC' },
  });

  const totalPage = Math.ceil(total / size);

  return {
    data,
    meta: {
      total,
      page,
      size,
      totalPage,
    },
  };
}

  async findOne(id: string): Promise<Product | null> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.productRepo.update(id, dto);
    const updatedProduct = await this.productRepo.findOne({ where: { id } });
    if (!updatedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }
}
