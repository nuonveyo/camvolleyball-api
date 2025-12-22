import { IsString, IsOptional, IsUrl, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsUrl()
    @IsOptional()
    logoUrl?: string;

    @ApiProperty({ required: false, default: 6 })
    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    size?: number;
}
