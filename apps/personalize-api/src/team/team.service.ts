import { Injectable, NotFoundException, ForbiddenException, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
        @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsService: ClientProxy,
    ) { }

    async create(createTeamDto: CreateTeamDto, userId: string): Promise<Team> {
        // 1. Create Team
        const team = this.teamRepository.create({
            ...createTeamDto,
            captainId: userId,
        });
        const savedTeam = await this.teamRepository.save(team);

        // 2. Add Captain as Member (ACCEPTED)
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
        // 1. Verify Permission (Only Captain can add members)
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
                // If member exists but is REJECTED or removed, we might want to re-invite? 
                // For now, skip to avoid duplicates.
                continue;
            }

            // 3. Add Member as PENDING (Invitation)
            const member = this.teamMemberRepository.create({
                teamId,
                userId: dto.userId,
                role: dto.role || TeamMemberRole.MEMBER,
                status: TeamMemberStatus.PENDING, // Default to PENDING for invites
                position: dto.position,
                jerseyNumber: dto.jerseyNumber
            });

            const saved = await this.teamMemberRepository.save(member);
            results.push(saved);

            // 4. Send Notification
            this.notificationsService.emit('notify_user', {
                recipientId: dto.userId,
                actorId: requesterId,
                type: 'TEAM_INVITE',
                entityId: teamId,
                message: `You have been invited to join team ${team.name}`,
            });
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

    async requestToJoin(teamId: string, userId: string): Promise<TeamMember> {
        const team = await this.findOne(teamId);

        // Check if already a member or pending
        const existing = await this.teamMemberRepository.findOne({ where: { teamId, userId } });
        if (existing) {
            if (existing.status === TeamMemberStatus.PENDING) {
                throw new ConflictException('You already have a pending request or invitation.');
            }
            if (existing.status === TeamMemberStatus.ACCEPTED) {
                throw new ConflictException('You are already a member of this team.');
            }
        }

        // Create Pending Member (Join Request)
        const member = this.teamMemberRepository.create({
            teamId,
            userId,
            role: TeamMemberRole.MEMBER,
            status: TeamMemberStatus.PENDING,
        });
        const saved = await this.teamMemberRepository.save(member);

        // Notify Captain
        this.notificationsService.emit('notify_user', {
            recipientId: team.captainId,
            actorId: userId,
            type: 'TEAM_JOIN_REQUEST',
            entityId: teamId,
            message: `User requested to join your team ${team.name}`,
        });

        return saved;
    }

    async acceptJoinRequest(teamId: string, memberUserId: string, captainId: string): Promise<TeamMember> {
        return this.updateMemberStatus(teamId, memberUserId, captainId, TeamMemberStatus.ACCEPTED, 'TEAM_JOIN_ACCEPTED');
    }

    async rejectJoinRequest(teamId: string, memberUserId: string, captainId: string): Promise<void> {
        await this.removeMember(teamId, memberUserId, captainId, 'TEAM_JOIN_REJECTED');
    }

    async acceptInvitation(teamId: string, userId: string): Promise<TeamMember> {
        const member = await this.teamMemberRepository.findOne({ where: { teamId, userId } });
        if (!member || member.status !== TeamMemberStatus.PENDING) {
            throw new NotFoundException('No pending invitation found');
        }

        member.status = TeamMemberStatus.ACCEPTED;
        const saved = await this.teamMemberRepository.save(member);

        const team = await this.findOne(teamId);

        // Notify Captain
        this.notificationsService.emit('notify_user', {
            recipientId: team.captainId,
            actorId: userId,
            type: 'TEAM_INVITE_ACCEPTED',
            entityId: teamId,
            message: `User accepted your invitation to join ${team.name}`,
        });

        return saved;
    }

    async rejectInvitation(teamId: string, userId: string): Promise<void> {
        const member = await this.teamMemberRepository.findOne({ where: { teamId, userId } });
        if (!member || member.status !== TeamMemberStatus.PENDING) {
            throw new NotFoundException('No pending invitation found');
        }

        await this.teamMemberRepository.remove(member);

        const team = await this.findOne(teamId);
        // Notify Captain
        this.notificationsService.emit('notify_user', {
            recipientId: team.captainId,
            actorId: userId,
            type: 'TEAM_INVITE_REJECTED',
            entityId: teamId,
            message: `User declined your invitation to join ${team.name}`,
        });
    }


    async removeMember(teamId: string, memberUserId: string, requesterId: string, notificationType: string = 'TEAM_MEMBER_REMOVED'): Promise<void> {
        const team = await this.findOne(teamId);

        if (team.captainId !== requesterId) {
            // Basic check: requester must be captain unless it's the user leaving themselves? 
            // Requirement says "Capitain of the team can be remove the members back". 
            // Assuming specifically Captain removing others.
            throw new ForbiddenException('Only the captain can remove members');
        }

        const member = await this.teamMemberRepository.findOne({ where: { teamId, userId: memberUserId } });
        if (!member) throw new NotFoundException('Member not found');

        await this.teamMemberRepository.remove(member);

        // Notify Removed User
        this.notificationsService.emit('notify_user', {
            recipientId: memberUserId,
            actorId: requesterId,
            type: notificationType,
            entityId: teamId,
            message: notificationType === 'TEAM_JOIN_REJECTED' ? `Your request to join ${team.name} was rejected` : `You have been removed from team ${team.name}`,
        });
    }

    // Helper to update status (Accept Request)
    private async updateMemberStatus(teamId: string, memberUserId: string, captainId: string, newStatus: TeamMemberStatus, notificationType: string): Promise<TeamMember> {
        const team = await this.findOne(teamId);
        if (team.captainId !== captainId) throw new ForbiddenException('Only captain can perform this action');

        const member = await this.teamMemberRepository.findOne({ where: { teamId, userId: memberUserId } });
        if (!member) throw new NotFoundException('Member request not found');

        member.status = newStatus;
        const saved = await this.teamMemberRepository.save(member);

        this.notificationsService.emit('notify_user', {
            recipientId: memberUserId,
            actorId: captainId,
            type: notificationType,
            entityId: teamId,
            message: `Your request to join ${team.name} has been accepted`,
        });

        return saved;
    }

    // Reuse remove for actual delete
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
