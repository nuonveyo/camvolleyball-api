import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Share } from './share.entity';
import { Venue } from './venue.entity';
import { Sector } from '../enums/sector.enum';
import { Event } from './event.entity';
import { OneToOne } from 'typeorm';

@Entity('posts')
export class Post extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @Column({
        type: 'enum',
        enum: Sector,
        default: Sector.SPORTS,
    })
    sector: Sector;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'jsonb', nullable: true })
    contents: any;

    @Column({ type: 'text', array: true, nullable: true })
    tags: string[];

    @Column({ type: 'enum', enum: ['public', 'followers'], default: 'public' })
    visibility: 'public' | 'followers';

    @Column({ name: 'likes_count', default: 0 })
    likesCount: number;

    @Column({ name: 'comments_count', default: 0 })
    commentsCount: number;

    @Column({ name: 'shares_count', default: 0 })
    sharesCount: number;

    @Column({ name: 'original_post_id', nullable: true })
    originalPostId: string;

    @ManyToOne(() => Post, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'original_post_id' })
    originalPost: Post;

    @Column({ name: 'venue_id', nullable: true })
    venueId: string;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];

    @OneToMany(() => Share, (share) => share.post)
    shares: Share[];

    @Column({ name: 'event_id', nullable: true })
    eventId: string;

    @OneToOne(() => Event, (event) => event.post)
    @JoinColumn({ name: 'event_id' })
    event: Event;
}
