import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('counters')
export class Counter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  label: string;

  @Column()
  value: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
