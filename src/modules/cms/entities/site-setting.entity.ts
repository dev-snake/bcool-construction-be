import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('site_settings')
export class SiteSetting extends BaseEntity {
  @Column({ name: 'setting_key', unique: true, length: 100 })
  settingKey!: string;

  @Column({ name: 'setting_value', type: 'text', nullable: true })
  settingValue!: string;

  @Column({ name: 'setting_group', length: 50, default: 'general' })
  settingGroup!: string;

  @Column({ length: 255, nullable: true })
  label!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;
}
