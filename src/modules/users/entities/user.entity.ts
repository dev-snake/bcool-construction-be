import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Role } from '../../roles/entities/role.entity';
import { Media } from '../../media/entities/media.entity';
import { LoginLog } from '../../logs/entities/login-log.entity';
import { Log } from '../../logs/entities/log.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Media, (media) => media.uploadedBy)
  mediaFiles: Media[];

  @OneToMany(() => LoginLog, (log) => log.user)
  loginLogs: LoginLog[];

  @OneToMany(() => Log, (log) => log.user)
  activityLogs: Log[];
}
