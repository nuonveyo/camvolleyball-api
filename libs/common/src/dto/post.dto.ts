import { IsString, IsOptional, IsUUID, ValidateNested, IsArray, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class MediaItemDto {
    @IsUrl()
    url: string;
}

export class PostContentDto {
    @IsString()
    @IsOptional()
    text?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MediaItemDto)
    images?: MediaItemDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MediaItemDto)
    videos?: MediaItemDto[];
}

export class CreatePostDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => PostContentDto)
    contents?: PostContentDto;

    @IsUUID()
    userId: string; // Passed from Gateway
}

export class UpdatePostDto {
    @IsUUID()
    id: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PostContentDto)
    contents?: PostContentDto;

    @IsUUID()
    userId: string; // Authenticated user
}
