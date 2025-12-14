import { IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
    @ApiProperty({ required: false, example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, example: 10, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({ required: false, example: 'volleyball' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, example: 'sports' })
    @IsOptional()
    @IsString()
    tag?: string;
}
