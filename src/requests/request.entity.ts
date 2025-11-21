import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RequestItem } from '../request-item/request-item.entity';
import { Attachment } from '../attachments/attachments.entity';
import { RequestStatusHistory } from '../request-status-history/request-status-history.entity';
import { User } from 'src/users/user.entity';

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

 @ApiProperty()
  @Column({ unique: true })
  code: string;


  @ApiProperty({ required: false, nullable: true })
  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  created_by: User | null;

  @OneToMany(() => RequestItem, (item) => item.request, { cascade: true })
  items: RequestItem[];

  @OneToMany(() => Attachment, (attachment) => attachment.request, {
    cascade: true,
  })
  attachments: Attachment[];

  @OneToMany(() => RequestStatusHistory, (history) => history.request, {
    cascade: true,
  })
  statusHistories: RequestStatusHistory[];
}
