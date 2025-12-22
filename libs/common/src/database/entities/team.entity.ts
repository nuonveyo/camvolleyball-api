import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { TeamMember } from './team-member.entity';
import { Event } from './event.entity';

@Entity('teams')
export class Team extends BaseEntity {
    @Column()
    name: string;

    @Column({ name: 'logo_url', nullable: true })
    logoUrl: string;

    @Column({ default: 6 })
    size: number; // Max size, e.g. 10

    @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
    rating: number;

    @Column({ name: 'captain_id' })
    captainId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'captain_id' })
    captain: User;

    @OneToMany(() => TeamMember, (member) => member.team)
    members: TeamMember[];

    // Events where this team is playing
    @OneToMany(() => Event, (event) => event.homeTeam)
    homeMatches: Event[];

    @OneToMany(() => Event, (event) => event.awayTeam)
    awayMatches: Event[];
}
