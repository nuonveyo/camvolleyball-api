import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('otp_codes')
export class OtpCode extends BaseEntity {
    @Column({ name: 'phone_number', length: 20 })
    phoneNumber: string;

    @Column({ length: 6 })
    code: string;

    @Column({ length: 20 })
    type: string; // REGISTER, FORGOT_PASS

    @Column({ name: 'expires_at' })
    expiresAt: Date;

    @Column({ name: 'is_used', default: false })
    isUsed: boolean;
}
