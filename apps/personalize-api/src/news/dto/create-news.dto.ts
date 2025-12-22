import { IsString, IsOptional, IsUrl, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SportType } from '@app/common/database/enums/sport-type.enum';
import { Sector } from '@app/common/database/enums/sector.enum';

export class CreateNewsDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ enum: SportType, required: false })
    @IsEnum(SportType)
    @IsOptional()
    sportType?: SportType;

    @ApiProperty({ enum: Sector, required: false })
    @IsEnum(Sector)
    @IsOptional()
    sector?: Sector;

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
