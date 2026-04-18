import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const logger = new Logger('Bootstrap');

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
}
bootstrap();
