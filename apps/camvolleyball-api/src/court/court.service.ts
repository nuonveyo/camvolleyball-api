import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from '@app/common';
import { CreateCourtDto, UpdateCourtDto } from './dto/create-court.dto';

@Injectable()
export class CourtService {
    constructor(
        @InjectRepository(Court)
        private courtRepository: Repository<Court>,
    ) { }

    async create(userId: string, dto: CreateCourtDto) {
        // TODO: Check if user has 'court_owner' role if needed. Assuming handled by AuthGuard or Controller logic.
        const court = this.courtRepository.create({
            ...dto,
            ownerId: userId,
        });
        return this.courtRepository.save(court);
    }

    async findAll() {
        return this.courtRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['availabilities'],
        });
    }

    async findOne(id: string) {
        const court = await this.courtRepository.findOne({
            where: { id },
            relations: ['availabilities'],
        });
        if (!court) throw new NotFoundException('Court not found');
        return court;
    }

    async update(userId: string, id: string, dto: UpdateCourtDto) {
        const court = await this.findOne(id);
        if (court.ownerId !== userId) {
            throw new ForbiddenException('You can only update your own courts');
        }
        Object.assign(court, dto);
        return this.courtRepository.save(court);
    }

    async remove(userId: string, id: string) {
        const court = await this.findOne(id);
        if (court.ownerId !== userId) {
            throw new ForbiddenException('You can only delete your own courts');
        }
        return this.courtRepository.softDelete(id);
    }
}
