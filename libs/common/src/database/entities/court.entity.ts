import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { CourtAvailability } from './court-availability.entity';

@Entity('courts')
export class Court extends BaseEntity {
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('text', { array: true, nullable: true })
    images: string[];

    @Column('text', { array: true, nullable: true })
    videos: string[];

    @Column({ name: 'number_of_pitches', default: 1 })
    numberOfPitches: number;

    @Column({ type: 'int', nullable: true, default: 0 })
    rating: number;

    // Location Data
    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number;

    @Column({ name: 'address_detail', type: 'text', nullable: true })
    addressDetail: string;

    @Column({ nullable: true })
    village: string;

    @Column({ nullable: true })
    commune: string;

    @Column({ nullable: true })
    district: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;

    // Contact Data
    @Column({ name: 'phone_number', nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    email: string;

    @Column({ name: 'website_url', nullable: true })
    websiteUrl: string;

    // Booking & Pricing Metadata
    @Column('text', { array: true, name: 'booking_types', default: '{}' })
    bookingTypes: string[]; // ['on_demand', 'fixed', 'set']

    @Column({ type: 'jsonb', name: 'pricing_policy', nullable: true })
    pricingPolicy: any;

    @Column({ name: 'owner_id' })
    ownerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => CourtAvailability, (availability) => availability.court)
    availabilities: CourtAvailability[];
}
