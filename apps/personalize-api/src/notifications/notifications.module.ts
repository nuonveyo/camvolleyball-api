import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsController } from './notifications.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'NOTIFICATIONS_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('NOTIFICATIONS_SERVICE_HOST') || '127.0.0.1',
                        port: parseInt(configService.get('NOTIFICATIONS_SERVICE_PORT') || '3004'),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [NotificationsController],
})
export class NotificationsModule { }
