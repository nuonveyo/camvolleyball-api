import { IsString, IsNotEmpty } from 'class-validator';

export class RequestResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    otp: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}
