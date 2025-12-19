import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Venue } from './venue.entity';

@Entity('venue_availabilities')
export class VenueAvailability extends BaseEntity {
    @Column({ name: 'venue_id' })
    venueId: string;

    @ManyToOne(() => Venue, (venue) => venue.availabilities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ type: 'date' })
    date: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({ type: 'boolean', default: true })
    is_available: boolean;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    price_override: number;
}
