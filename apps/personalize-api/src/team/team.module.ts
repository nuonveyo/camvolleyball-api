import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { Team, TeamMember } from '@app/common';

@Module({
    imports: [
        TypeOrmModule.forFeature([Team, TeamMember]),
    ],
    controllers: [TeamController],
    providers: [TeamService],
    exports: [TeamService],
})
export class TeamModule { }
