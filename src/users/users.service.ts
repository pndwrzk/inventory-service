import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { IdResponseDto } from 'src/common/dto/id-response.dto';
import { UserRole } from './user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<IdResponseDto> {
    // Cek username unik
    const existing = await this.userRepo.findOne({ where: { username: data.username } });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    // Validasi role ↔ branch_id
    if (data.role === UserRole.BRANCH && !data.branch_id) {
      throw new BadRequestException('branch_id is required for role "branch"');
    }
    if ((data.role === UserRole.STAFF || data.role === UserRole.SUPERVISOR) && data.branch_id) {
      throw new BadRequestException('branch_id must be empty for staff or supervisor');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = this.userRepo.create({
      ...data,
      password: hashedPassword,
    });

    const saved = await this.userRepo.save(user);
    return { id: saved.id };
  }

  
}
