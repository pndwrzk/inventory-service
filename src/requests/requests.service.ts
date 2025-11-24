import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import {
  RequestResponseDto,
  RequestResponseErrorItemDTO,
} from './dto/request-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/user.entity';
import { UserRole } from 'src/users/user-role.enum';
import { CountRequestResponseDto } from './dto/count-request-response';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(RequestItem)
    private readonly requestItemRepository: Repository<RequestItem>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

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
        created_by: { id: userId },
        code: this.generateRequestCode(),
      });
      const savedRequest = await queryRunner.manager.save(request);

      const arrItems = JSON.parse(dto.items || '[]');
      if (arrItems.length <= 0) {
        throw new BadRequestException(`Items is required`);
      }

      const errItems: RequestResponseErrorItemDTO[] = [];
      for (const item of arrItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.product_id },
        });

        if (!product) {
          errItems.push({
            product_id: item.product_id,
            product_name: null,
            details: 'Product not found',
          });
          continue;
        }

        if (product.stock <= 0) {
          errItems.push({
            product_id: item.product_id,
            product_name: product.name,
            details: 'Product out of stock',
          });
          continue;
        }

        if (item.quantity > product.stock) {
          errItems.push({
            product_id: item.product_id,
            product_name: product.name,
            details: `Requested quantity (${item.quantity}) exceeds available stock (${product.stock})`,
          });
          continue;
        }
      }

      if (errItems.length > 0) {
        throw new BadRequestException(errItems);
      }

      const items = arrItems.map((item) =>
        queryRunner.manager.create(RequestItem, {
          request: savedRequest,
          product: { id: item.product_id } as Product,
          quantity: item.quantity,
        }),
      );

      await queryRunner.manager.save(items);

      const statusHistory = queryRunner.manager.create(RequestStatusHistory, {
        action_by: userId,
        status: RequestStatus.PENDING,
        remark: dto.remarks || null,
        request: savedRequest,
      });

      await queryRunner.manager.save(statusHistory);

      if (files?.length > 0) {
        const uploadDir = path.join(process.cwd(), 'uploads/attachments');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const attachments = files.map((file) => {
          if (!file.buffer) {
            throw new BadRequestException(
              `${file.originalname} tidak ada buffer`,
            );
          }

          const filename = uuidv4();
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, file.buffer);

          return queryRunner.manager.create(Attachment, {
            request: savedRequest,
            file_path: path.join('uploads/attachments', filename),
            requestStatusHistory: statusHistory,
          });
        });

        await queryRunner.manager.save(attachments);
      }

      await queryRunner.commitTransaction();

      return savedRequest;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async findAll(
    page: number,
    size: number,
    userId: string,
  ): Promise<{
    data: RequestResponseDto[];
    meta: { total: number; page: number; size: number; totalPage: number };
  }> {
    const skip = (page - 1) * size;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User Not Found`);
    }


    const [requests, total] = await this.requestRepository.findAndCount({
      where: {
        created_by: user.role === UserRole.BRANCH ? { id: userId } : {},
      },
      relations: [
        'items',
        'items.product',
        'statusHistories.attachments',
        'statusHistories',
        'statusHistories.user',
      ],
      order: {
        created_at: 'DESC',
        statusHistories: {
          created_at: 'DESC',
        },
      },
      skip,
      take: size,
    });

    const totalPage = Math.ceil(total / size);

    const data = requests.map((req) => ({
      id: req.id,
      code: req.code,
      current_status: req.statusHistories?.[0]?.status || 'Unknown',
      pickup_schedule: req.pickup_schedule || null,
      items: req.items?.map((item) => ({
        id: item.id,
        product_name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
      })),
      status_histories: req.statusHistories?.map((s) => ({
        id: s.id,
        status: s.status,
        remark: s.remark,
        action_by: s.user.username,
        created_at: s.created_at,
        attachments: s.attachments?.map((a) => ({
          id: a.id,
          url_file: `${'http://103.63.25.53:3001'}/${a.file_path}`,
        })),
      })),
      created_at: req.created_at,
      updated_at: req.updated_at,
    }));

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

  async approveRequest(
    requestId: string,
    userId: string,
    pickupSchedule: Date,
    remark?: string,
  ): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['statusHistories'],
    });
    if (!request) {
      throw new NotFoundException(`Request with id ${requestId} not found`);
    }

    request.pickup_schedule = pickupSchedule;
    await this.requestRepository.save(request);

    const statusHistory = this.requestStatusHistoryRepository.create({
      action_by: userId,
      status: RequestStatus.APPROVED,
      remark: remark || null,
      request: request,
    });
    await this.requestStatusHistoryRepository.save(statusHistory);

    return request;
  }

  async rejectRequest(
    requestId: string,
    userId: string,
    remark?: string,
  ): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['statusHistories'],
    });
    if (!request) {
      throw new NotFoundException(`Request with id ${requestId} not found`);
    }

    const statusHistory = this.requestStatusHistoryRepository.create({
      action_by: userId,
      status: RequestStatus.REJECTED,
      remark: remark || null,
      request: request,
    });
    await this.requestStatusHistoryRepository.save(statusHistory);

    return request;
  }

  async completeRequest(
    requestId: string,
    userId: string,
    files: Express.Multer.File[],
    dto: any,
  ): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['statusHistories', 'statusHistories.attachments'],
    });

    if (!request) {
      throw new NotFoundException(`Request with id ${requestId} not found`);
    }

    const queryRunner =
      this.requestRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const statusHistory = queryRunner.manager.create(RequestStatusHistory, {
        action_by: userId,
        status: RequestStatus.COMPLETED,
        remark: dto.remarks || null,
        request: request,
      });

      await queryRunner.manager.save(statusHistory);

      if (files?.length > 0) {
        const uploadDir = path.join(process.cwd(), 'uploads/attachments');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const attachments = files.map((file) => {
          if (!file.buffer) {
            throw new BadRequestException(
              `${file.originalname} tidak ada buffer`,
            );
          }

          const filename = `${Date.now()}-${file.originalname}`;
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, file.buffer);

          return queryRunner.manager.create(Attachment, {
            request: request,
            file_path: path.join('uploads/attachments', filename),
            requestStatusHistory: statusHistory,
          });
        });

        await queryRunner.manager.save(attachments);
      }

      await queryRunner.commitTransaction();

      return request;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRequest(requestId: string): Promise<{ requestId: string }> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['items', 'statusHistories', 'statusHistories.attachments'],
    });

    if (!request) {
      throw new NotFoundException(`Request with id ${requestId} not found`);
    }

    const queryRunner =
      this.requestRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Attachment, {
        request: { id: request.id },
      });

      for (const statusHistory of request.statusHistories) {
        for (const attachment of statusHistory.attachments || []) {
          const filePath = path.join(process.cwd(), attachment.file_path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await queryRunner.manager.delete(Attachment, {
          requestStatusHistory: { id: statusHistory.id },
        });
        await queryRunner.manager.delete(RequestStatusHistory, {
          id: statusHistory.id,
        });
      }

      await queryRunner.manager.delete(RequestItem, {
        request: { id: request.id },
      });

      await queryRunner.manager.delete(Request, { id: request.id });
      await queryRunner.commitTransaction();

      return { requestId };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private generateRequestCode(length = 18): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const now = Date.now().toString(36);
    let code = now;
    while (code.length < length) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code.slice(0, length);
  }

  async countAllStatus(): Promise<CountRequestResponseDto> {
  const total_pending = await this.requestStatusHistoryRepository.count({
    where: { status: RequestStatus.PENDING },
  });

  const total_approved = await this.requestStatusHistoryRepository.count({
    where: { status: RequestStatus.APPROVED },
  });

  const total_rejected = await this.requestStatusHistoryRepository.count({
    where: { status: RequestStatus.REJECTED },
  });

  const total_completed = await this.requestStatusHistoryRepository.count({
    where: { status: RequestStatus.COMPLETED },
  });

  return {
    total_pending,
    total_approved,
    total_rejected,
    total_completed,
  };
}

}
