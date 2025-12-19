import { Injectable, NotFoundException, Inject, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from '@app/common/database/entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/create-venue.dto';
import { PaginationDto } from '@app/common';
import { Sector } from '@app/common/database/enums/sector.enum';

@Injectable()
export class VenueService {
    constructor(
        @InjectRepository(Venue)
        private readonly venueRepository: Repository<Venue>,
    ) { }

    async create(createVenueDto: CreateVenueDto, userId: string): Promise<Venue> {
        const { sportType, ...rest } = createVenueDto;

        // Map DTO specific fields to metadata if needed, or handle generically
        // For now, assuming CreateVenueDto maps directly or via transformation
        const venue = this.venueRepository.create({
            ...rest,
            sector: sportType ? (sportType as unknown as Sector) : Sector.SPORTS, // Temporary mapping until DTO is fully generic
            ownerId: userId,
        });
        return this.venueRepository.save(venue);
    }

    async findAll(paginationDto: PaginationDto, sector?: Sector): Promise<{ data: Venue[], total: number }> {
        const { page = 1, limit = 10, search } = paginationDto;
        const skip = (page - 1) * limit;

        const query = this.venueRepository.createQueryBuilder('venue');

        if (sector) {
            query.andWhere('venue.sector = :sector', { sector });
        }

        if (search) {
            query.andWhere('(venue.name ILIKE :search OR venue.description ILIKE :search)', { search: `%${search}%` });
        }

        const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

        return { data, total };
    }

    async findOne(id: string): Promise<Venue> {
        const venue = await this.venueRepository.findOne({ where: { id }, relations: ['availabilities'] });
        if (!venue) {
            throw new NotFoundException(`Venue with ID ${id} not found`);
        }
        return venue;
    }

    async update(id: string, updateVenueDto: UpdateVenueDto, userId: string): Promise<Venue> {
        const venue = await this.findOne(id);

        // Check ownership logic here if needed
        // if (venue.ownerId !== userId) throw new ForbiddenException();

        Object.assign(venue, updateVenueDto);
        return this.venueRepository.save(venue);
    }

    async remove(id: string, userId: string): Promise<void> {
        const venue = await this.findOne(id);
        // Check ownership
        if (venue.ownerId !== userId) {
            throw new ForbiddenException('You can only delete your own venues');
        }
        await this.venueRepository.softDelete(id);
    }
}
