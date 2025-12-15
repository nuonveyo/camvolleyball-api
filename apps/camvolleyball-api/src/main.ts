import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../../libs/common/src/filters/http-exception.filter';

import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // HTTPS Options (Self-Signed for Mobile Dev)
  const httpsOptions = {
    key: fs.readFileSync(path.join(process.cwd(), 'key.pem')),
    cert: fs.readFileSync(path.join(process.cwd(), 'cert.pem')),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('camvolleyball/v1');
  app.useGlobalInterceptors(new TransformInterceptor());

  // Increase body limit for larger payloads (though files should go to S3)
  // Increase body limit for larger payloads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const config = new DocumentBuilder()
    .setTitle('CamVolleyball API')
    .setDescription('The CamVolleyball API description')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Users')
    .addTag('Posts')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
