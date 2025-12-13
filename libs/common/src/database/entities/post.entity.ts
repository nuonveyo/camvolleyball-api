import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Share } from './share.entity';

@Entity('posts')
export class Post extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

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

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];

    @OneToMany(() => Share, (share) => share.post)
    shares: Share[];
}
