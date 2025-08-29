import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true, // In production, replace with your frontend URL
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable transformation
      transformOptions: {
        enableImplicitConversion: false, // Disable implicit conversion to rely on our explicit transforms
      },
      whitelist: true, // Remove properties that are not in the DTO
      forbidNonWhitelisted: false, // Allow non-whitelisted properties (for file uploads)
      skipMissingProperties: false, // Don't skip validation for missing properties
      validateCustomDecorators: true, // Validate custom decorators
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
