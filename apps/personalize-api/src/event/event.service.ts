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
}
