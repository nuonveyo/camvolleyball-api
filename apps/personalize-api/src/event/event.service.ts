import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, Post } from '@app/common';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
    ) { }

    async createEvent(dto: CreateEventDto, userId: string) {
        // 1. Create Event
        const event = this.eventRepository.create({
            title: dto.title,
            matchDate: dto.matchDate,
            matchType: dto.matchType,
            venueId: dto.venueId,
            homeTeamId: dto.homeTeamId,
            awayTeamId: dto.awayTeamId,
        });
        const savedEvent = await this.eventRepository.save(event);

        // 2. Create Linked Post
        if (dto.post) {
            const post = this.postRepository.create({
                ...dto.post,
                userId: userId,
                eventId: savedEvent.id, // Link back to event
                // Sector is likely inherited or set to SPORTS
            });
            const savedPost = await this.postRepository.save(post);

            // Update event with post_id
            savedEvent.postId = savedPost.id;
            await this.eventRepository.save(savedEvent);
        }

        return savedEvent;
    }

    async createEventOnly(dto: any, userId: string) {
        const event = this.eventRepository.create({
            title: dto.title,
            matchDate: dto.matchDate,
            matchType: dto.matchType,
            venueId: dto.venueId,
            homeTeamId: dto.homeTeamId,
            awayTeamId: dto.awayTeamId,
        });
        return this.eventRepository.save(event);
    }

    async updateEventPostId(eventId: string, postId: string) {
        await this.eventRepository.update(eventId, { postId });
    }

    async findAll(limit: number = 5): Promise<Event[]> {
        // Requirement: "up comming event (matchDate <= currentDate)"
        // Note: The user phrase "up comming" contradicts "matchDate <= currentDate" (Past).
        // The sorting by likes/comments implies past/ongoing events.
        // We will strictly follow the logic: matchDate <= NOW, limit 5, sort by popularity.

        const now = new Date();

        return this.eventRepository.createQueryBuilder('event')
            .leftJoinAndSelect('event.post', 'post')
            .leftJoinAndSelect('event.homeTeam', 'homeTeam')
            .leftJoinAndSelect('event.awayTeam', 'awayTeam')
            .leftJoinAndSelect('event.venue', 'venue')
            .where('event.matchDate >= :now', { now })
            .addSelect('(COALESCE(post.likesCount, 0) + COALESCE(post.commentsCount, 0) + COALESCE(post.sharesCount, 0))', 'popularity')
            .orderBy('popularity', 'DESC')
            .addOrderBy('event.matchDate', 'ASC')
            .take(limit)
            .getMany();
    }
}
