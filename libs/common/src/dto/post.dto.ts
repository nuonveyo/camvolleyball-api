import { IsString, IsOptional, IsUUID, ValidateNested, IsArray, IsUrl, IsEnum } from 'class-validator';
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

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsEnum(['public', 'followers'])
    visibility?: 'public' | 'followers';

    @IsOptional()
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

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsUUID()
    userId: string; // Authenticated user
}
