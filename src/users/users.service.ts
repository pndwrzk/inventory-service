import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { IdResponseDto } from 'src/common/dto/id-response.dto';
import { UserRole } from './user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto): Promise<IdResponseDto> {
    const existing = await this.userRepo.findOne({
      where: { username: data.username },
    });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    // Validasi role ↔ branch_id
    if (data.role === UserRole.BRANCH && !data.branch_id) {
      throw new BadRequestException('branch_id is required for role "branch"');
    }
    if (
      (data.role === UserRole.STAFF || data.role === UserRole.SUPERVISOR) &&
      data.branch_id
    ) {
      throw new BadRequestException(
        'branch_id must be empty for staff or supervisor',
      );
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

  async login(username: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    
    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    const accessTokenExp = Math.floor(Date.now() / 1000) + 60 * 60;
    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;

    return {
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
      },
      tokens: {
        access_token: accessToken,
        access_token_expired: accessTokenExp,
        refresh_token: refreshToken,
        refresh_token_expired: refreshTokenExp,
      },
    };
  }


  async findById(id: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }
}
