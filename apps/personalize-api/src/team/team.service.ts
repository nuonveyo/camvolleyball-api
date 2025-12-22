import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamMember, TeamMemberRole, TeamMemberStatus } from '@app/common';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(Team)
        private teamRepository: Repository<Team>,
        @InjectRepository(TeamMember)
        private teamMemberRepository: Repository<TeamMember>,
    ) { }

    async create(createTeamDto: CreateTeamDto, userId: string): Promise<Team> {
        // 1. Create Team
        const team = this.teamRepository.create({
            ...createTeamDto,
            captainId: userId,
        });
        const savedTeam = await this.teamRepository.save(team);

        // 2. Add Captain as Member
        const member = this.teamMemberRepository.create({
            teamId: savedTeam.id,
            userId: userId,
            role: TeamMemberRole.CAPTAIN,
            status: TeamMemberStatus.ACCEPTED,
        });
        await this.teamMemberRepository.save(member);

        return savedTeam;
    }
}
