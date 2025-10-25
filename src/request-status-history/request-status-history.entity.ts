import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Request } from '../requests/request.entity';
import { RequestStatus } from './request-status.enum';
import { Attachment } from 'src/attachments/attachments.entity';


@Entity('request_status_history')
export class RequestStatusHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Request })
  @ManyToOne(() => Request, { eager: false })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ApiProperty({ enum: RequestStatus })
  @Column({
    type: 'enum',
    enum: RequestStatus,
  })
  status: RequestStatus;


  @ApiProperty()
  @Column({ type: 'uuid' })
  action_by: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'action_by' })
  user: User;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Attachment, (attachment) => attachment.requestStatusHistory)
  attachments: Attachment[];
}
