import { IsString, IsOptional, IsUUID, ValidateNested, IsArray, IsUrl, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MediaItemDto {
    @ApiProperty({ example: 'https://example.com/image.jpg' })
    @IsUrl({ require_tld: false })
    url: string;

    @ApiProperty({ required: false, example: 'posts/123/image.jpg' })
    @IsString()
    @IsOptional()
    key?: string; // S3 Key

    @ApiProperty({ required: false, example: 'image/jpeg' })
    @IsString()
    @IsOptional()
    type?: string; // MIME type

    @ApiProperty({ required: false, example: 1080 })
    @IsOptional()
    width?: number;

    @ApiProperty({ required: false, example: 1920 })
    @IsOptional()
    height?: number;
}

export class PostContentDto {
    @ApiProperty({ required: false, example: 'This is my awesome post!' })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiProperty({ type: [MediaItemDto], required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MediaItemDto)
    images?: MediaItemDto[];

    @ApiProperty({ type: [MediaItemDto], required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MediaItemDto)
    videos?: MediaItemDto[];
}

export class CreatePostDto {
    @ApiProperty({ type: PostContentDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => PostContentDto)
    contents?: PostContentDto;

    @ApiProperty({ example: ['sports', 'volleyball'], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({ enum: ['public', 'followers'], required: false, example: 'public' })
    @IsOptional()
    @IsEnum(['public', 'followers'])
    visibility?: 'public' | 'followers';

    @ApiProperty({ required: false, description: 'Injected by Controller' })
    @IsOptional()
    @IsUUID()
    userId: string; // Passed from Gateway
}

export class UpdatePostDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Post ID' })
    @IsOptional()
    @IsUUID()
    id: string;

    @ApiProperty({ type: PostContentDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => PostContentDto)
    contents?: PostContentDto;

    @ApiProperty({ example: ['sports'], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({ enum: ['public', 'followers'], required: false, example: 'public' })
    @IsOptional()
    @IsEnum(['public', 'followers'])
    visibility?: 'public' | 'followers';

    @ApiProperty({ required: false, description: 'Injected by Controller' })
    @IsOptional()
    @IsUUID()
    userId: string; // Authenticated user
}

export class CreateShareDto {
    @ApiProperty({ required: false, description: 'Optional description for the shared post' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false, description: 'Injected by Controller' })
    @IsOptional()
    @IsUUID()
    postId: string;

    @ApiProperty({ required: false, description: 'Injected by Controller' })
    @IsOptional()
    @IsUUID()
    userId: string;
}
