import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/branches/branch.entity';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { User } from 'src/users/user.entity';
import { Request } from 'src/requests/request.entity';
import { Product } from 'src/products/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, User, Request, Product])],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
