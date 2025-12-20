import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from '@app/common/database/entities/venue.entity';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

@Module({
    imports: [TypeOrmModule.forFeature([Venue])],
    controllers: [VenueController],
    providers: [VenueService],
    exports: [VenueService],
})
export class VenueModule { }
