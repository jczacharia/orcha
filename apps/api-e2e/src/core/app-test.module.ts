/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import 'reflect-metadata';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { OrchaNestModule } from '@orcha/nestjs';
import { DomainModule } from '../../../api/src/app/domain/domain.module';

@Module({
  imports: [
    DomainModule,
    OrchaNestModule.forRoot(),
    MikroOrmModule.forRoot({
      autoLoadEntities: true,
      dbName: 'orcha-todo-example-app-e2e',
      type: 'postgresql',
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: '1Qazxsw2',
      allowGlobalContext: true,
    }),
  ],
})
export class AppTestModule {}
