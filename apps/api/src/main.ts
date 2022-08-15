/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const orm = app.get(MikroORM);
  const generator = orm.getSchemaGenerator();

  // await generator.dropSchema();
  await generator.updateSchema();
  console.log('Schema Updated');

  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/orcha`);
}

bootstrap();
