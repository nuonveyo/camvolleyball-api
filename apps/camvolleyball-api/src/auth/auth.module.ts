import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User, OtpCode, UserProfile, Role, UserDevice } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, OtpCode, UserProfile, Role, UserDevice]),
        PassportModule,
        ClientsModule.registerAsync([
            {
                name: 'NOTIFICATIONS_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('NOTIFICATIONS_SERVICE_HOST') || 'localhost',
                        port: configService.get('NOTIFICATIONS_SERVICE_PORT') || 3004,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'supersecretkey',
                signOptions: { expiresIn: configService.get('JWT_EXPIRE') || '7d' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
