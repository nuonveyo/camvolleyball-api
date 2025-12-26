import { IsString, IsPhoneNumber, IsEnum, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OtpType {
    VERIFICATION = 'verification',
    PASSWORD_RESET = 'password_reset',
}

export class SendOtpDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsPhoneNumber(undefined, { message: 'validation.invalid_phone' })
    @Length(6, 16, { message: 'validation.phone_length' })
    phoneNumber: string;

    @ApiProperty({ enum: OtpType, example: OtpType.VERIFICATION, description: 'OTP type' })
    @IsEnum(OtpType)
    type: OtpType;
}

export class ConfirmOtpDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsPhoneNumber(undefined, { message: 'validation.invalid_phone' })
    @Length(6, 16, { message: 'validation.phone_length' })
    phoneNumber: string;

    @ApiProperty({ example: '123456', description: 'OTP code' })
    @IsString()
    code: string;

    @ApiProperty({ enum: OtpType, example: OtpType.VERIFICATION, description: 'OTP type' })
    @IsEnum(OtpType)
    type: OtpType;
}
