import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostController } from './post.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SocialModule } from '../social/social.module';
import { ProfileModule } from '../profile/profile.module';
import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../event/event.module';

@Module({
    imports: [
        ConfigModule,
        SocialModule,
        SocialModule,
        ProfileModule,
        AuthModule,
        EventModule,
        ClientsModule.registerAsync([
            {
                name: 'POST_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('POST_SERVICE_HOST') || '127.0.0.1',
                        port: parseInt(configService.get('POST_SERVICE_PORT') || '3001'),
                    },
                }),
                inject: [ConfigService],
            },
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
    controllers: [PostController],
})
export class PostModule { }
