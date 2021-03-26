import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(3333, 'localhost');

  console.log(`Orcha Todo Example App API is running on: ${await app.getUrl()}`);
}

bootstrap();
