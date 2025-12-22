import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SportType } from '../enums/sport-type.enum';
import { Sector } from '../enums/sector.enum';

@Entity('news')
export class News extends BaseEntity {
    @Column()
    title: string;

    @Column({
        type: 'enum',
        enum: SportType,
        name: 'sport_type',
        nullable: true,
    })
    sportType: SportType;

    @Column({
        type: 'enum',
        enum: Sector,
        default: Sector.SPORTS,
    })
    sector: Sector;

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
