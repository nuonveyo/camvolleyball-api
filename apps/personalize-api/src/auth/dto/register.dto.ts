import { IsString, IsPhoneNumber, MinLength, MaxLength, Length, Matches, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sector } from '@app/common';

export class RegisterDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsPhoneNumber(undefined, { message: 'validation.invalid_phone' })
    @Length(6, 16, { message: 'validation.phone_length' })
    phoneNumber: string;

    @ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
    @IsString()
    @Length(6, 12, { message: 'validation.password_length' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,12}$/, { message: 'validation.password_complexity' })
    password: string;

    @ApiProperty({ example: 'password123', description: 'Confirm password' })
    @IsString()
    @Length(6, 12, { message: 'validation.password_length' })
    confirmPassword: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Verification token from OTP confirmation' })
    @IsString()
    verificationToken: string;

    @ApiProperty({ example: 'device-12345', description: 'Unique Device ID from Client' })
    @IsString()
    deviceId: string;

    @ApiProperty({ example: 'Sokha Volleyball', description: 'User Nickname', required: false })
    @IsString()
    nickname: string;

    @ApiProperty({ example: ['sports'], description: 'Interested Sectors', required: false, enum: Sector, isArray: true })
    @IsOptional()
    @IsArray()
    @IsEnum(Sector, { each: true, message: 'validation.invalid_sector' })
    interestedSectors: Sector[];
}
