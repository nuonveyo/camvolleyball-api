import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../../libs/common/src/filters/http-exception.filter';

import * as fs from 'fs';
import * as path from 'path';
import { I18nService } from 'nestjs-i18n';

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
  const i18nService = app.get(I18nService);
  app.useGlobalFilters(new HttpExceptionFilter(i18nService as any));
  app.setGlobalPrefix('personalize/v1');
  app.useGlobalInterceptors(new TransformInterceptor());

  // Increase body limit for larger payloads (though files should go to S3)
  // Increase body limit for larger payloads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Secure Swagger UI
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const basicAuth = require('express-basic-auth');
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER || 'admin']: process.env.SWAGGER_PASSWORD || 'admin',
        },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Personalize API')
    .setDescription(' The Personalize API description')
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
