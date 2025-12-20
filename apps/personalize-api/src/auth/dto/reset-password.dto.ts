import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}

export class ResetPasswordDto {
    @ApiProperty({ example: 'eyJh...', description: 'Verification token from OTP' })
    @IsString()
    @IsNotEmpty()
    verificationToken: string;

    @ApiProperty({ example: 'newpassword123', description: 'New password (min 6 chars)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
