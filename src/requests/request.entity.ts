import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RequestItem } from '../request-item/request-item.entity';
import { Attachment } from '../attachments/attachments.entity';
import { RequestStatusHistory } from '../request-status-history/request-status-history.entity';

@Entity('requests')
export class Request {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  pickup_schedule: Date | null;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;


  @OneToMany(() => RequestItem, (item) => item.request, { cascade: true })
  items: RequestItem[];


  @OneToMany(() => Attachment, (attachment) => attachment.request, { cascade: true })
  attachments: Attachment[];


  @OneToMany(() => RequestStatusHistory, (history) => history.request, {
    cascade: true,
  })
  statusHistories: RequestStatusHistory[];
}
