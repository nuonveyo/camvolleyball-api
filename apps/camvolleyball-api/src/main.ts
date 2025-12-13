import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('camvolleyball/v1');
  app.useGlobalInterceptors(new TransformInterceptor());

  // Increase body limit for larger payloads (though files should go to S3)
  // Increase body limit for larger payloads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
