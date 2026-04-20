import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SentryFilter } from './common/filters/sentry.filter';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }

  app.use(cookieParser());
  const logger = new Logger('Bootstrap');

  // Swagger — only in non-production OR if SWAGGER_ENABLED=true
  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Waterting CRM API')
      .setDescription('Real Estate CRM — Multi-tenant API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', in: 'header' },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication & user management')
      .addTag('leads', 'Lead management & pipeline')
      .addTag('bookings', 'Booking & payment flows')
      .addTag('projects', 'Project, tower & unit management')
      .addTag('site-visits', 'Site visit scheduling & tracking')
      .addTag('brokers', 'Broker management & commissions')
      .addTag('analytics', 'Reports & analytics')
      .addTag('listings', 'External platform listings')
      .addTag('portal', 'Buyer portal')
      .addTag('notifications', 'Notification management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    });
  }

  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [
        undefined,
        'http://localhost:3000',
        process.env.FRONTEND_URL,
        /waterting.*\.vercel\.app$/,
      ];
      const ok = allowed.some(a =>
        !a ? !origin : a instanceof RegExp ? a.test(origin ?? '') : a === origin
      );
      ok ? callback(null, true) : callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept'],
    credentials: true,
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapterHost));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.use((req: any, res: any, next: any) => {
    res.on('finish', () => {
      const level = res.statusCode >= 400 ? 'warn' : 'log';
      logger[level](`${req.method} ${req.url} → ${res.statusCode}`);
    });
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
  logger.log(`API running on port ${process.env.PORT ?? 3001}`);
  logger.log(`Swagger docs available at http://localhost:3001/api/docs`);
}
bootstrap();
