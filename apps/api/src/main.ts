import { NestFactory } from '@nestjs/core';
import { environment } from '@orcha-todo-example-app/shared/domain';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { AppModule } from './app/app.module';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(3333, environment.host);

  console.log(`Orcha Todo Example App API is running on: ${await app.getUrl()}`);
}

bootstrap();
