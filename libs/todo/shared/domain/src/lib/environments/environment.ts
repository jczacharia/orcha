import { Env } from './environment.env';

export const environment: Env = {
  production: false,
  host: 'localhost',
  apiUrl: `http://localhost:3333`,
  wsUrl: `http://localhost:80`,
  mikroOrmConfig: {
    autoLoadEntities: true,
    dbName: 'orcha-todo-example-app',
    type: 'postgresql',
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1Qazxsw2',
    debug: true,
  },
};
