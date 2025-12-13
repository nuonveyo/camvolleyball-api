import { IsString, IsOptional, IsUUID, ValidateNested, IsArray, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class MediaItemDto {
    @IsUrl({ require_tld: false })
    url: string;

    @IsString()
    @IsOptional()
    key?: string; // S3 Key

    @IsString()
    @IsOptional()
    type?: string; // MIME type

    @IsOptional()
    width?: number;

    @IsOptional()
    height?: number;
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
