import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Venue } from './venue.entity';
import { Team } from './team.entity';
import { Post } from './post.entity';
import { MatchType } from '../enums/match-type.enum';

@Entity('events')
export class Event extends BaseEntity {
    @Column()
    title: string; // e.g., "Friendly Match"

    @Column({ name: 'match_date', type: 'timestamp' })
    matchDate: Date;

    @Column({
        type: 'enum',
        enum: MatchType,
        name: 'match_type',
        default: MatchType.SIX_VS_SIX
    })
    matchType: MatchType;

    @Column({ name: 'venue_id' })
    venueId: string;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    // Teams
    @Column({ name: 'home_team_id', nullable: true })
    homeTeamId: string;

    @ManyToOne(() => Team, (team) => team.homeMatches)
    @JoinColumn({ name: 'home_team_id' })
    homeTeam: Team;

    @Column({ name: 'away_team_id', nullable: true })
    awayTeamId: string;

    @ManyToOne(() => Team, (team) => team.awayMatches)
    @JoinColumn({ name: 'away_team_id' })
    awayTeam: Team;

    // Link to main Post
    @Column({ name: 'post_id', nullable: true })
    postId: string;

    @OneToOne(() => Post, (post) => post.event)
    post: Post;
}
