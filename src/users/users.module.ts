import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';



@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
  ],
  providers: [UsersService, JwtAccessStrategy, JwtRefreshStrategy],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
