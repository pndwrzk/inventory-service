import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/user-role.enum';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userService: UsersService,
  ) {}
  async create(
    dto: CreateBranchDto,
  ): Promise<{
    branch: Branch;
    account: { username: string; password: string };
  }> {
    const branch = await this.branchRepo.save(this.branchRepo.create(dto));

    const username = dto.name.toLowerCase().replace(/\s+/g, '_');
    const password = await this.generatePassword();

    await this.userService.create({
      username,
      password,
      role: UserRole.BRANCH,
      branch_id: branch.id,
      full_name: dto.name,
    });

    return {
      branch,
      account: {
        username,
        password,
      },
    };
  }

  async findAll(
    page: number,
    size: number,
    search?: string,
  ): Promise<{
    data: Branch[];
    meta: { total: number; page: number; size: number; totalPage: number };
  }> {
    const skip = (page - 1) * size;

    const where = search ? { name: ILike(`%${search}%`) } : {};

    const [data, total] = await this.branchRepo.findAndCount({
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
    if (result.affected) {
      await this.userRepo.delete({ branch: { id } });
      return;
    }
    throw new Error(`Branch with id ${id} not found`);
  }

  async generatePassword(): Promise<string> {
    const length = 8;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  }
}
