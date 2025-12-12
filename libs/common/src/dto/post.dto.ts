import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsUUID()
    userId: string; // Passed from Gateway
}

export class UpdatePostDto {
    @IsUUID()
    id: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsUUID()
    userId: string; // Authenticated user
}
