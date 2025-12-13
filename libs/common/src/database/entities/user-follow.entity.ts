import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Column } from 'typeorm';
import { User } from './user.entity';

@Entity('user_follows')
@Unique(['followerId', 'followingId'])
export class UserFollow {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'follower_id' })
    followerId: string;

    @Column({ name: 'following_id' })
    followingId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'follower_id' })
    follower: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'following_id' })
    following: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
