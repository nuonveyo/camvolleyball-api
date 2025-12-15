import { IsString, IsPhoneNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: '+85512345678', description: 'User phone number' })
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'device-12345', description: 'Unique Device ID from Client' })
    @IsString()
    deviceId: string;
}
