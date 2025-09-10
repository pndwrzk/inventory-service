import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepo.create(dto);
    return await this.branchRepo.save(branch);
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepo.find();
  }

  async findOne(id: string): Promise<Branch | null> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) {
       throw new Error(`Branch with id ${id} not found`);
    }
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    await this.branchRepo.update(id, dto);
    const updatedBranch = await this.branchRepo.findOne({ where: { id } });
    if (!updatedBranch) {
      throw new Error(`Branch with id ${id} not found`);
    }
    return updatedBranch;
  }

  async remove(id: string): Promise<void> {
    const result = await this.branchRepo.delete(id);
    if (!result.affected) {
      throw new Error(`Branch with id ${id} not found`);
    }
  }
}
