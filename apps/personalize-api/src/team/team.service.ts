import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

    async findOne(id: string): Promise<Team> {
        const team = await this.teamRepository.findOne({
            where: { id },
            relations: ['members', 'members.user', 'members.user.profile']
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }
        return team;
    }

    async update(id: string, updateTeamDto: any, userId: string): Promise<Team> {
        const team = await this.findOne(id);

        if (team.captainId !== userId) {
            throw new ForbiddenException('Only the captain can update the team');
        }

        Object.assign(team, updateTeamDto);
        return this.teamRepository.save(team);
    }

    async remove(id: string, userId: string): Promise<void> {
        const team = await this.findOne(id);

        if (team.captainId !== userId) {
            throw new ForbiddenException('Only the captain can delete the team');
        }

        await this.teamRepository.softRemove(team);
    }

    async findMyTeams(userId: string): Promise<any[]> {
        const teams = await this.teamRepository.createQueryBuilder('team')
            .innerJoin('team.members', 'myMembership', 'myMembership.userId = :userId', { userId })
            .leftJoin('team.members', 'members')
            .leftJoin('members.user', 'user')
            .leftJoin('user.profile', 'profile')
            .addSelect([
                'team',
                'members.userId', 'members.role', 'members.status', 'members.position', 'members.jerseyNumber',
                'user.id',
                'profile.nickname', 'profile.avatarUrl' // Select nickname instead of names
            ])
            .loadRelationCountAndMap('team.memberCount', 'team.members')
            .getMany();

        return this.mapTeamsResponse(teams);
    }

    async findAll(paginationDto: any, name?: string) {
        const { limit = 10, page = 1 } = paginationDto;
        const skippedItems = (page - 1) * limit;

        const query = this.teamRepository.createQueryBuilder('team')
            .leftJoin('team.members', 'members')
            .leftJoin('members.user', 'user')
            .leftJoin('user.profile', 'profile')
            .addSelect([
                'team',
                'members.userId', 'members.role', 'members.status', 'members.position', 'members.jerseyNumber',
                'user.id',
                'profile.nickname', 'profile.avatarUrl'
            ])
            .loadRelationCountAndMap('team.memberCount', 'team.members')
            .take(limit)
            .skip(skippedItems);

        if (name) {
            query.where('team.name ILIKE :name', { name: `%${name}%` });
        }

        const [teams, total] = await query.getManyAndCount();

        return {
            data: this.mapTeamsResponse(teams),
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    private mapTeamsResponse(teams: Team[]): any[] {
        return teams.map(team => ({
            ...team,
            members: team.members.map(member => ({
                userId: member.userId,
                role: member.role,
                status: member.status,
                position: member.position,
                jerseyNumber: member.jerseyNumber,
                user: member.user?.profile ? {
                    nickname: member.user.profile.nickname,
                    avatarUrl: member.user.profile.avatarUrl
                } : null
            }))
        }));
    }
}
