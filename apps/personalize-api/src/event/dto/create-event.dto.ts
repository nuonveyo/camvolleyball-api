import { IsString, IsDateString, IsEnum, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchType } from '@app/common';
import { CreatePostDto } from '@app/common'; // We might need to extend or compose this

export class CreateEventDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsDateString()
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

    // The Post Data
    @ApiProperty()
    @ValidateNested()
    @Type(() => CreatePostDto)
    post: CreatePostDto;
}
