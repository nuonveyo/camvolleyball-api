import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from '@app/common';
import { CourtController } from './court.controller';
import { CourtService } from './court.service';

@Module({
    imports: [TypeOrmModule.forFeature([Court])],
    controllers: [CourtController],
    providers: [CourtService],
})
export class CourtModule { }
