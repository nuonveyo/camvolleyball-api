import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_devices')
export class UserDevice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    user_id: string;

    @Column({ name: 'device_id' })
    device_id: string;

    @Column({ name: 'fcm_token', nullable: true })
    fcm_token: string;

    @Column({ name: 'last_login_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_login_at: Date;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
