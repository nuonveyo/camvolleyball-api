import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RequestResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    verificationToken: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
