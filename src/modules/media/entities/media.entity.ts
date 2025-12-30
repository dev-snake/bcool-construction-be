import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('media')
export class Media extends BaseEntity {
  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;
}
