import { IsString, IsOptional, IsEnum, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamMemberRole, TeamMemberStatus } from '@app/common';

export class AddMemberDto {
    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty({ enum: TeamMemberRole, default: TeamMemberRole.MEMBER })
    @IsEnum(TeamMemberRole)
    @IsOptional()
    role?: TeamMemberRole;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    position?: string; // e.g., 'Setter', 'Libero'

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    jerseyNumber?: number;
}
