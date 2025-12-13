import { IsString, IsNotEmpty, IsUUID, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PostContentDto } from './post.dto';

export class CreateCommentDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => PostContentDto)
    contents?: PostContentDto;

    @IsUUID()
    postId: string;

    @IsUUID()
    userId: string;
}
