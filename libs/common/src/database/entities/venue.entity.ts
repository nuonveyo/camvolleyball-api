import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { VenueAvailability } from './venue-availability.entity';
import { Sector } from '../enums/sector.enum';

@Entity('venues')
export class Venue extends BaseEntity {
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: Sector,
        default: Sector.SPORTS,
    })
    sector: Sector;

    @Column({ nullable: true }) // e.g. 'football_field', 'hotel', 'resort'
    category: string;

    @Column('text', { array: true, nullable: true })
    images: string[];

    @Column('text', { array: true, nullable: true })
    videos: string[];

    @Column({ type: 'int', nullable: true, default: 0 })
    rating: number;

    // Location Data
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    })
    latitude: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    })
    longitude: number;

    @Column({ name: 'address_detail', type: 'text', nullable: true })
    addressDetail: string;

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

    // Generic Metadata (For specific fields like numberOfPitches, pricing, etc.)
    @Column({ type: 'jsonb', nullable: true, default: '{}' })
    metadata: any;

    @Column({ name: 'owner_id' })
    ownerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => VenueAvailability, (availability) => availability.venue)
    availabilities: VenueAvailability[];
}
