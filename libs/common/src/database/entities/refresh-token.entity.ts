import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'token_hash' })
    tokenHash: string;

    @Column({ name: 'device_name', nullable: true })
    deviceName: string;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'expires_at' })
    expiresAt: Date;

    @Column({ name: 'is_revoked', default: false })
    isRevoked: boolean;
}
