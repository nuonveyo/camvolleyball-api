import { IsString, IsPhoneNumber, IsEnum } from 'class-validator';

export enum OtpType {
    REGISTER = 'REGISTER',
    FORGOT_PASS = 'FORGOT_PASS',
}

export class SendOtpDto {
    @IsPhoneNumber()
    phoneNumber: string;

    @IsEnum(OtpType)
    type: OtpType;
}

export class ConfirmOtpDto {
    @IsPhoneNumber()
    phoneNumber: string;

    @IsString()
    code: string;

    @IsEnum(OtpType)
    type: OtpType;
}
