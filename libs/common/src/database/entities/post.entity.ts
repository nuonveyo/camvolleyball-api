import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('posts')
export class Post extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'image_url', type: 'text', nullable: true })
    imageUrl: string;

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
}
