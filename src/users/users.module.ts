import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { Branch } from 'src/branches/branch.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([User ,Branch]),
    JwtModule.register({}),
  ],
  providers: [UsersService, JwtAccessStrategy, JwtRefreshStrategy],
  controllers: [UsersController],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
