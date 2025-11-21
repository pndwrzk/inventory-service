import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from 'src/branches/branch.entity';
import { User } from 'src/users/user.entity';
import { Request } from 'src/requests/request.entity';
import { Product } from 'src/products/products.entity';
import { ResponseSummaryDTO } from './dto/summary-response.dto';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Request)
    private readonly requestRepo: Repository<Request>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getSummary(): Promise<ResponseSummaryDTO> {
    const total_branches = await this.branchRepo.count();
    const total_users = await this.userRepo.count();
    const total_requests = await this.requestRepo.count();
    const total_products = await this.productRepo.count();

    return {
      total_branches,
      total_users,
      total_requests,
      total_products,
    };
  }
}
