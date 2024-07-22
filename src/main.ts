import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main-PaymentsMS');

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      /* transform: true, */
      whitelist: true,
      /* skipMissingProperties: true, */
      forbidNonWhitelisted: true,
      /* disableErrorMessages: false, */
      /* validationError: { target: false, value: false }, */
    }),
  );

  await app.listen(envs.port);
  logger.log(`Payments Microservice running on port ${envs.port}`);
}
bootstrap();
