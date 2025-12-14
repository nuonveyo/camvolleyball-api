import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPresignedUrlDto {
    @ApiProperty({ example: 'profile-pic.jpg', description: 'Name of the file to upload' })
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty({ example: 'image/jpeg', description: 'MIME type of the file' })
    @IsString()
    @IsNotEmpty()
    @IsIn([
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm'
    ], { message: 'Invalid file type. Only images and videos are allowed.' })
    fileType: string;
}
