import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostController } from './post.controller';

import { AuthModule } from '../auth/auth.module';
import { SocialModule } from '../social/social.module';

@Module({
    imports: [
        AuthModule,
        SocialModule,
        ClientsModule.register([
            {
                name: 'POST_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3001,
                },
            },
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
    controllers: [PostController],
})
export class PostModule { }
