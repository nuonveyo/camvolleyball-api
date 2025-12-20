import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { FileServiceModule } from './file-service.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Use a temporary app context to get ConfigService for port
  const appContext = await NestFactory.createApplicationContext(FileServiceModule);
  const configService = appContext.get(ConfigService);
  const TCP_PORT = 3003; // Hardcode or use configService.get('FILE_SERVICE_PORT')

  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: TCP_PORT,
      },
    },
  );
  await app.listen();
}
bootstrap();
