import { IsString, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchType } from '../database/enums/match-type.enum';

export class CreateEventDetailsDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    matchDate: Date;

    @ApiProperty({ enum: MatchType })
    @IsEnum(MatchType)
    matchType: MatchType;

    @ApiProperty()
    @IsUUID()
    venueId: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    homeTeamId?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    awayTeamId?: string;
}
