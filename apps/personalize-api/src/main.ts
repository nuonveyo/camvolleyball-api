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
  let appOptions = {};

  // Only try to use HTTPS if NOT in production AND keys exist
  if (process.env.NODE_ENV !== 'production') {
    const keyPath = path.join(process.cwd(), 'key.pem');
    const certPath = path.join(process.cwd(), 'cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      appOptions = {
        httpsOptions: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
      };
    }
  }

  const app = await NestFactory.create(AppModule, appOptions);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('personalize/v1');
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
