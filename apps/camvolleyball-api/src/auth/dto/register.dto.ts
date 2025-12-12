import { IsString, IsPhoneNumber, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsPhoneNumber()
    phoneNumber: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(6)
    confirmPassword: string;
}
