import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GetPresignedUrlDto {
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsString()
    @IsNotEmpty()
    @IsIn([
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm'
    ], { message: 'Invalid file type. Only images and videos are allowed.' })
    fileType: string;
}
