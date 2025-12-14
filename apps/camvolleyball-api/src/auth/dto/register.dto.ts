import { IsString, IsPhoneNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'password123', description: 'Confirm password' })
    @IsString()
    @MinLength(6)
    confirmPassword: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Verification token from OTP confirmation' })
    @IsString()
    verificationToken: string;
}
