import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { User } from '../users/user.entity';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, User]), 
    UsersModule,                              
  ],
  providers: [
    BranchesService,
    UsersService
  
  ],
  controllers: [BranchesController],
  exports: [BranchesService],
})
export class BranchesModule {}
