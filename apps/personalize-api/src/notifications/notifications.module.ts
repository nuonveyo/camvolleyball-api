import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsController } from './notifications.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'NOTIFICATIONS_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3004,
                },
            },
        ]),
    ],
    controllers: [NotificationsController],
})
export class NotificationsModule { }
