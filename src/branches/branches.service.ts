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

  create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepo.create(dto);
    return this.branchRepo.save(branch);
  }

  findAll(): Promise<Branch[]> {
    return this.branchRepo.find();
  }

  findOne(id: string): Promise<Branch | null> {
    return this.branchRepo.findOne({ where: { id } });
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
    await this.branchRepo.delete(id);
  }
}
