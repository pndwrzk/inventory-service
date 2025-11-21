import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';


import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { Request } from './request.entity';
import { RequestItem } from '../request-item/request-item.entity';
import { Attachment } from '../attachments/attachments.entity';
import { RequestStatusHistory } from '../request-status-history/request-status-history.entity';
import { Product } from 'src/products/products.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request,
      RequestItem,
      Attachment,
      RequestStatusHistory,
      Product,
      User
    ]),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
