import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostController } from './post.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'POST_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1', // Or service name if docker-compose networking, but for local dev 127.0.0.1. 
                    // If running in docker, needs service name 'post-service' but gateway is on host?
                    // Assuming local running with `npm run start`.
                    port: 3001,
                },
            },
        ]),
    ],
    controllers: [PostController],
})
export class PostModule { }
