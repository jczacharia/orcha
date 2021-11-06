import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const environment = {
  production: false,
  host: 'localhost',
  apiUrl: `http://localhost:3333`,
  wsUrl: `http://localhost:80`,
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
