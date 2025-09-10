import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from './request.entity';
import { RequestItem } from '../request-item/request-item.entity';
import { Attachment } from '../attachments/attachments.entity';
import { RequestStatusHistory } from '../request-status-history/request-status-history.entity';
import { RequestStatus } from '../request-status-history/request-status.enum';
import { Product } from 'src/products/products.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(RequestItem)
    private readonly requestItemRepository: Repository<RequestItem>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    @InjectRepository(RequestStatusHistory)
    private readonly requestStatusHistoryRepository: Repository<RequestStatusHistory>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    dto: any,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<Request> {
    const queryRunner =
      this.requestRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = queryRunner.manager.create(Request, {
        pickup_schedule: null,
      });
      const savedRequest = await queryRunner.manager.save(request);

      const arrItems = JSON.parse(dto.items);
      if (arrItems.length) {
        const items = arrItems.map(async (item) => {
          const itemExist = await this.productRepository.findOne({
            where: { id: item.product_id },
          });
          if (!itemExist) {
            throw new BadRequestException(
              `Product with id ${item.product_id} not found`,
            );
          }

          if (item.quantity <= 0) {
            throw new BadRequestException(
              `Quantity for product ${itemExist.name} must be greater than zero`,
            );
          }

          if (item.quantity > itemExist.stock) {
            throw new BadRequestException(
              `Quantity for product ${itemExist.name} exceeds available stock`,
            );
          }

          return queryRunner.manager.create(RequestItem, {
            request: savedRequest,
            product: { id: item.product_id } as any,
            quantity: item.quantity,
          });
        });
        await queryRunner.manager.save(items);
      }

      if (files?.length) {
        const uploadDir = path.join(process.cwd(), 'uploads/attachments');
        if (!fs.existsSync(uploadDir))
          fs.mkdirSync(uploadDir, { recursive: true });

        const attachments = files.map((file) => {
          if (!file.buffer)
            throw new BadRequestException(
              `${file.originalname} tidak ada buffer`,
            );

          const filename = `${Date.now()}-${file.originalname}`;
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, file.buffer);

          return queryRunner.manager.create(Attachment, {
            request: savedRequest,
            file_path: path.join('uploads/attachments', filename),
          });
        });

        await queryRunner.manager.save(attachments);
      }

      const statusHistory = queryRunner.manager.create(RequestStatusHistory, {
        action_by: userId,
        status: RequestStatus.PENDING,
        remark: dto.remarks || null,
        request: savedRequest,
      });
      await queryRunner.manager.save(statusHistory);

      await queryRunner.commitTransaction();

      return savedRequest;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
