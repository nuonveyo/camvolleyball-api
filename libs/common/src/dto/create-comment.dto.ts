import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsUUID()
    postId: string;

    @IsUUID()
    userId: string;
}
