import { IsString, IsPhoneNumber, IsEnum } from 'class-validator';

export enum OtpType {
    VERIFICATION = 'verification',
    PASSWORD_RESET = 'password_reset',
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
