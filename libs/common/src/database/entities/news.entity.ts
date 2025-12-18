import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('news')
export class News extends BaseEntity {
    @Column()
    title: string;

    @Column({ name: 'thumbnail_url', nullable: true })
    thumbnailUrl: string;

    @Column({ name: 'original_url' })
    originalUrl: string;

    @Column({ name: 'news_url' })
    newsUrl: string;

    @Column({ name: 'source_name', nullable: true })
    sourceName: string;

    @Column({ name: 'is_visible', default: true })
    isVisible: boolean;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'post_date', type: 'timestamp', nullable: true })
    postDate: Date;
}
