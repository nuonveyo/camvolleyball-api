import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Team } from './team.entity';
import { TeamMemberRole } from '../enums/team-member-role.enum';
import { TeamMemberStatus } from '../enums/team-member-status.enum';

@Entity('team_members')
export class TeamMember extends BaseEntity {
    @Column({ name: 'team_id' })
    teamId: string;

    @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'enum',
        enum: TeamMemberRole,
        default: TeamMemberRole.MEMBER,
    })
    role: TeamMemberRole;

    @Column({
        type: 'enum',
        enum: TeamMemberStatus,
        default: TeamMemberStatus.PENDING,
    })
    status: TeamMemberStatus;
}
