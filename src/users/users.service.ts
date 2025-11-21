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
import { UserListResponseDto } from './dto/user-list-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Branch } from 'src/branches/branch.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Branch)
        private readonly branchRepository: Repository<Branch>,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto): Promise<IdResponseDto> {
    console.log(data);
    const existing = await this.userRepo.findOne({
      where: { username: data.username },
    });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }


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


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    let branch : Branch | null = null;
    if (data.branch_id) {
      branch = await this.branchRepository.findOne({ where: { id: data.branch_id } });
      if (!branch) {
        throw new BadRequestException('branch not found');
      }
    }

    const user = this.userRepo.create({
      ...data,
      branch,
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
        role : user.role
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
  async getAll(): Promise<UserListResponseDto[]> {
  const users = await this.userRepo.find({
    relations: ['branch'],
    order: { created_at: 'DESC' },
  });
  return users.map((user) => ({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    branch: user.branch
      ? {
          id: user.branch.id,
          name: user.branch.name,
        }
      : null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }));
}

async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
  if (!refreshToken) {
    throw new UnauthorizedException('Missing refresh token');
  }

  try {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newPayload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(newPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });

    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const accessTokenExp = Math.floor(Date.now() / 1000) + 60 * 60;

    return {
     
        access_token: accessToken,
        access_token_expired: accessTokenExp,
        refresh_token: refreshToken,
        refresh_token_expired: refreshTokenExp,
    
    };
  } catch (err) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }
}


}
