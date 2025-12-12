import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PostServiceModule } from './post-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PostServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', // Listen on all interfaces
        port: 3001,
      },
    },
  );
  await app.listen();
}
bootstrap();
