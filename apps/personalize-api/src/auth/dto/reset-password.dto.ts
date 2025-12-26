import { IsString, IsNotEmpty, MinLength, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsString()
    @IsNotEmpty()
    @Length(6, 16, { message: 'validation.phone_length' })
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
    @Length(6, 12, { message: 'validation.password_length' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,12}$/, { message: 'validation.password_complexity' })
    newPassword: string;
}
