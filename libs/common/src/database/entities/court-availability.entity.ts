import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Court } from './court.entity';

@Entity('court_availability')
export class CourtAvailability extends BaseEntity {
    @Column({ name: 'day_of_week' })
    dayOfWeek: number; // 0-6 (Sun-Sat)

    @Column({ name: 'open_time', type: 'time' })
    openTime: string;

    @Column({ name: 'close_time', type: 'time' })
    closeTime: string;

    @Column({ name: 'is_closed', default: false })
    isClosed: boolean;

    @Column({ name: 'court_id' })
    courtId: string;

    @ManyToOne(() => Court, (court) => court.availabilities)
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
