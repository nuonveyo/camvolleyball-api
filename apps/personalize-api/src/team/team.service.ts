import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamMember, TeamMemberRole, TeamMemberStatus } from '@app/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddMemberDto } from './dto/add-member.dto';

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

    async addMembers(teamId: string, dtos: AddMemberDto[], requesterId: string): Promise<TeamMember[]> {
        // 1. Verify Permission (Only Captain can add members for now)
        const team = await this.teamRepository.findOne({ where: { id: teamId } });
        if (!team) throw new Error('Team not found');

        if (team.captainId !== requesterId) {
            throw new Error('Only the captain can add members');
        }

        const results: TeamMember[] = [];

        for (const dto of dtos) {
            // 2. Check if already member
            const existing = await this.teamMemberRepository.findOne({ where: { teamId, userId: dto.userId } });
            if (existing) {
                // Skip existing members to prevent duplicates/errors
                continue;
            }

            // 3. Add Member
            const member = this.teamMemberRepository.create({
                teamId,
                userId: dto.userId,
                role: dto.role || TeamMemberRole.MEMBER,
                status: TeamMemberStatus.ACCEPTED,
                position: dto.position,
                jerseyNumber: dto.jerseyNumber
            });

            const saved = await this.teamMemberRepository.save(member);
            results.push(saved);
        }

        return results;
    }
}
