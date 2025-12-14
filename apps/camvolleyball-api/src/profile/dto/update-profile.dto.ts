import { IsString, IsOptional, IsNumber, IsDateString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ required: false, example: 'John' })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false, example: 'Doe' })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false, example: 'VolleyKing' })
    @IsOptional()
    @IsString()
    nickname?: string;

    @ApiProperty({ required: false, example: 'Love playing volleyball!' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiProperty({ required: false, example: 'Single', description: 'Marital Status' })
    @IsOptional()
    @IsString()
    maritalStatus?: string;

    @ApiProperty({ required: false, example: 'Male' })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiProperty({ required: false, example: '1995-05-15' })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: Date;

    @ApiProperty({ required: false, example: 185 })
    @IsOptional()
    @IsNumber()
    heightCm?: number;

    @ApiProperty({ required: false, example: 80 })
    @IsOptional()
    @IsNumber()
    weightKg?: number;

    @ApiProperty({ required: false, example: 'Cambodian' })
    @IsOptional()
    @IsString()
    nationality?: string;

    @ApiProperty({ required: false, example: 'contact@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false, example: 'Phnom Penh' })
    @IsOptional()
    @IsString()
    currentAddress?: string;

    @ApiProperty({ required: false, example: 'Amateur' })
    @IsOptional()
    @IsString()
    level?: string;
}
