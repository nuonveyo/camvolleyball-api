import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
    @ApiProperty({ example: 'device-12345', description: 'Device ID to logout' })
    @IsString()
    @IsNotEmpty()
    deviceId: string;
}
