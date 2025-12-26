import { IsString, IsPhoneNumber, MinLength, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsPhoneNumber(undefined, { message: 'validation.invalid_phone' })
    @Length(6, 16, { message: 'validation.phone_length' })
    phoneNumber: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'device-12345', description: 'Unique Device ID from Client' })
    @IsString()
    deviceId: string;

    @ApiProperty({ example: 'fcm-token-abc', description: 'FCM Token for Push Notifications', required: false })
    @IsString()
    @IsOptional()
    fcmToken?: string;
}
