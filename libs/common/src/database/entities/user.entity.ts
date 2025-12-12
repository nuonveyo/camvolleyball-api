import { Entity, Column, OneToOne, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserProfile } from './user-profile.entity';
import { Role } from './role.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ name: 'phone_number', unique: true, length: 20 })
    phoneNumber: string;

    @Column({ name: 'password_hash', nullable: true })
    passwordHash: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    // Relations
    @OneToOne(() => UserProfile, (profile) => profile.user)
    profile: UserProfile;

    @ManyToMany(() => Role)
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];
}
