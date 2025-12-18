import { IsString, IsOptional, IsUrl, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ required: false })
    @IsUrl()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiProperty()
    @IsUrl()
    originalUrl: string;

    @ApiProperty()
    @IsUrl()
    newsUrl: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    sourceName?: string;

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    isVisible?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    postDate?: Date;
}
