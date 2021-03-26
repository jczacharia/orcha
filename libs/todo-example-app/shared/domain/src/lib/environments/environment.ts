import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const environment = {
  production: false,
  apiUrl: `http://localhost:3333`,
  typeOrmConfig: {
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: '1Qazxsw2',
    database: 'orcha-todo-example-app',
    synchronize: true,
    autoLoadEntities: true,
    ssl: false,
  } as TypeOrmModuleOptions,
};
