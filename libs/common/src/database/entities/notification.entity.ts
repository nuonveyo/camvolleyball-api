import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
    LIKE = 'LIKE',
    COMMENT = 'COMMENT',
    FOLLOW = 'FOLLOW',
    NEW_POST = 'NEW_POST',
    SHARE = 'SHARE',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'recipient_id' })
    recipientId: string;

    @Column({ name: 'actor_id' })
    actorId: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ name: 'entity_id', nullable: true })
    entityId: string; // ID of the Post, Comment, etc.

    @Column({ nullable: true })
    message: string;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipient_id' })
    recipient: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'actor_id' })
    actor: User;
}
