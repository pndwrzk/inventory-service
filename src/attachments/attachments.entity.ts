import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from '../requests/request.entity';

@Entity('attachments')
export class Attachment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Request })
  @ManyToOne(() => Request, { eager: false })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ApiProperty()
  @Column({ type: 'text' })
  file_path: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
