import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    async create(@Body() dto: CreateEventDto, @Request() req) {
        return this.eventService.createEvent(dto, req.user.userId);
    }
}
