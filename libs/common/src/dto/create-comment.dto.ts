import { IsString, IsNotEmpty, IsUUID, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PostContentDto } from './post.dto';

export class CreateCommentDto {
    @ApiProperty({ type: PostContentDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => PostContentDto)
    contents?: PostContentDto;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Post ID' })
    @IsUUID()
    postId: string;

    @ApiProperty({ required: false, description: 'Injected by Controller' })
    @IsUUID()
    userId: string;
}
