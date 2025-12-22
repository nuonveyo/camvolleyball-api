import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event, Post } from '@app/common';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event, Post]),
    ],
    controllers: [EventController],
    providers: [EventService],
    exports: [EventService],
})
export class EventModule { }
