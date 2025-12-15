import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn, UpdateDateColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
    @PrimaryColumn({ name: 'user_id' })
    userId: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'first_name', nullable: true, length: 100 })
    firstName: string;

    @Column({ name: 'last_name', nullable: true, length: 100 })
    lastName: string;

    @Column({ nullable: true, length: 50 })
    nickname: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ name: 'marital_status', nullable: true, length: 50 })
    maritalStatus: string;

    @Column({ nullable: true, length: 20 })
    gender: string;

    @Column({ name: 'date_of_birth', type: 'timestamp', nullable: true })
    dateOfBirth: Date;

    @Column({ name: 'height_cm', type: 'decimal', precision: 5, scale: 2, nullable: true })
    heightCm: number;

    @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
    weightKg: number;

    @Column({ nullable: true, length: 100 })
    nationality: string;

    @Column({ nullable: true })
    email: string;

    @Column({ name: 'current_address', type: 'text', nullable: true })
    currentAddress: string;

    @Column({ type: 'text', array: true, nullable: true })
    position: string[];

    @Column({ nullable: true, length: 50 })
    level: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
