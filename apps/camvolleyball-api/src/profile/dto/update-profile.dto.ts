import { IsString, IsOptional, IsNumber, IsDateString, IsEmail } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    nickname?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    maritalStatus?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: Date;

    @IsOptional()
    @IsNumber()
    heightCm?: number;

    @IsOptional()
    @IsNumber()
    weightKg?: number;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsEmail()
    email?: string; // Contact email, different from Auth?

    @IsOptional()
    @IsString()
    currentAddress?: string;

    @IsOptional()
    @IsString()
    level?: string;

    // Position array could be handled but simple for now
}
