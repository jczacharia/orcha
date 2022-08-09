import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ServerOrchaModule } from '@orcha/todo/server/orcha';
import 'reflect-metadata';

jest.setTimeout(20000);

@Module({
  imports: [
    ServerOrchaModule,
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
