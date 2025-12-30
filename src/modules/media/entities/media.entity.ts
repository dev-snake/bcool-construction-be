import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('media_files')
export class Media extends BaseEntity {
  @Column({ name: 'file_name', length: 255, nullable: true })
  fileName: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_type', length: 50, nullable: true })
  fileType: string;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedById: string;

  @ManyToOne(() => User, (user) => user.mediaFiles, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;
}
